const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const router = express.Router();

// ✅ Email OTP Function
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ SMTP Transporter Configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,   // SMTP server (e.g., smtp.mailtrap.io, smtp.yourdomain.com)
    port: process.env.SMTP_PORT,   // SMTP port (e.g., 587 for TLS, 465 for SSL)
    secure: process.env.SMTP_PORT === '465', // true for SSL, false for TLS
    auth: {
        user: process.env.SMTP_USER, // SMTP username
        pass: process.env.SMTP_PASS  // SMTP password
    }
});

// Verify the transporter
transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Transporter Error:", error);
    } else {
        console.log("SMTP Transporter is ready.");
    }
});

// ✅ Signup with OTP Verification
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // Generate OTP and hash it
        const otp = generateOTP();
        console.log("Generated OTP:", otp);  // Log OTP for debugging

        const hashedOTP = await bcrypt.hash(otp, 10);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            otp: hashedOTP, 
            otpExpires: Date.now() + 300000, // OTP expires in 5 mins
            isVerified: false 
        });

        try {
            await newUser.save();
            console.log("User saved successfully");
        } catch (error) {
            console.error("Error saving user:", error);
            return res.status(500).json({ message: "Error saving user to database" });
        }

        // Send OTP email
        try {
            await transporter.sendMail({
                from: process.env.SMTP_USER,   // Sender's email
                to: email,                    // Recipient's email
                subject: "Verify Your OTP",   // Email subject
                text: `Your OTP is ${otp}`,   // Email body
            });
            res.json({ message: "OTP Sent" });
        } catch (error) {
            console.error("Error sending OTP email:", error);
            return res.status(500).json({ message: "Error in sending OTP email", error });
        }
    } catch (error) {
        console.error("Error in Signup:", error);
        res.status(500).json({ message: "Error in Signup" });
    }
});

// ✅ Verify OTP for Signup
router.post("/verify-signup-otp", async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (!user.otpExpires || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

        user.otp = null;
        user.otpExpires = null;
        user.isVerified = true;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Error in OTP Verification" });
    }
});

// ✅ Login with Email & Password
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (!user.isVerified) return res.status(400).json({ message: "Email not verified. Please complete OTP verification." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Error in Login" });
    }
});

// ✅ OTP Login (Forgot Password / Alternate Login)
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const otp = generateOTP();
        user.otp = await bcrypt.hash(otp, 10);
        user.otpExpires = Date.now() + 300000;
        await user.save();

        await transporter.sendMail({
            from: process.env.SMTP_USER,   // Sender's email
            to: email,                    // Recipient's email
            subject: "Your OTP Code",     // Email subject
            text: `Your OTP is ${otp}`,   // Email body
        });

        res.json({ message: "OTP Sent Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error in Sending OTP" });
    }
});

// Forgot Password (Send Reset Link)
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const resetLink = `http://localhost:5173/reset-password/${token}`;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,   // Sender's email
            to: email,                    // Recipient's email
            subject: "Reset Password",    // Email subject
            text: `Click here to reset password: ${resetLink}`, // Email body
        });

        res.json({ message: "Password reset link sent!" });
    } catch (error) {
        res.status(500).json({ message: "Error in sending password reset email", error });
    }
});

router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (!user.otpExpires || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

        user.otp = null;
        user.otpExpires = null;
        user.isVerified = true;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Error in OTP Verification" });
    }
});

// 📌 Reset Password (via Token)
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Verify JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        console.error("Error in resetting password:", err);
        res.status(400).json({ message: "Invalid or expired token" });
    }
});


// // ✅ OAuth Login Routes
// router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
//     res.redirect("http://localhost:5173/dashboard");
// });

// router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
// router.get("/github/callback", passport.authenticate("github", { session: false }), (req, res) => {
//     res.redirect("http://localhost:5173/dashboard");
// });

// router.get("/linkedin", passport.authenticate("linkedin"));
// router.get("/linkedin/callback", passport.authenticate("linkedin", { session: false }), (req, res) => {
//     res.redirect("http://localhost:5173/dashboard");
// });

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
    if (!req.user) {
        return res.redirect("https://st-blogs.vercel.app/login?error=OAuthFailed");
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Redirect to frontend with the token
    res.redirect(`https://st-blogs.vercel.app/dashboard?token=${token}`);
});

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback", passport.authenticate("github", { session: false }), (req, res) => {
    if (!req.user) {
        return res.redirect("https://st-blogs.vercel.app/login?error=OAuthFailed");
    }

    const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.redirect(`https://st-blogs.vercel.app/dashboard?token=${token}`);
});

router.get("/linkedin", passport.authenticate("linkedin"));

router.get("/linkedin/callback", passport.authenticate("linkedin", { session: false }), (req, res) => {
    if (!req.user) {
        return res.redirect("https://st-blogs.vercel.app/login?error=OAuthFailed");
    }

    const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.redirect(`https://st-blogs.vercel.app/dashboard?token=${token}`);
});




module.exports = router;
