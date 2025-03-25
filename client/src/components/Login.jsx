import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for sending OTP
  const [timer, setTimer] = useState(0); // Timer state for countdown
  const [canResend, setCanResend] = useState(false); // To show the "Resend OTP" button
  const navigate = useNavigate();
  

  // Handle Login (Email & Password)
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  // Handle OTP Request
  const requestOtp = async () => {
    setIsLoading(true); // Show loading state
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", { email });
      toast.success("OTP sent to your email!");
      setOtpSent(true);
      startTimer();
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false); // Hide loading state after request completes
    }
  };

  // Start the 1-minute timer
  const startTimer = () => {
    let countdown = 60; // 1-minute countdown
    setTimer(countdown);
    setCanResend(false); // Disable resend initially

    const intervalId = setInterval(() => {
      countdown -= 1;
      setTimer(countdown);
      if (countdown <= 0) {
        clearInterval(intervalId); // Stop the timer when it reaches 0
        setCanResend(true); // Enable resend OTP button
      }
    }, 1000); // Update every second
  };

  // Handle OTP Login
  const handleOtpLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
      localStorage.setItem("token", res.data.token);
      toast.success("OTP Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  // Handle OAuth Login
  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error("Failed to send reset link");
    }
  };

  // Handle OAuth Callback after successful login
  const handleOAuthCallback = (token, user) => {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error("OAuth Login failed");
    }
  };

  useEffect(() => {
    // Check for OAuth response in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");

    if (token && user) {
      // Handle OAuth login if token and user are found in URL params
      handleOAuthCallback(token, JSON.parse(user));
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-4">{isOtpLogin ? "Login with OTP" : "Login"}</h2>

      {!isOtpLogin ? (
        <form onSubmit={handleLogin} className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-3 bg-gray-700 text-white rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-3 bg-gray-700 text-white rounded"
            required
          />
          <button type="submit" className="w-full bg-blue-500 p-2 rounded">Login</button>
        </form>
      ) : (
        <form onSubmit={handleOtpLogin} className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-3 bg-gray-700 text-white rounded"
            required
            disabled={otpSent}
          />
          {!otpSent ? (
            <>
              <button
                type="button"
                onClick={requestOtp}
                className={`w-full p-2 rounded ${isLoading ? "bg-gray-600" : "bg-green-500"}`}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 mb-3 bg-gray-700 text-white rounded"
                required
              />
              <button type="submit" className="w-full bg-blue-500 p-2 rounded">Verify OTP</button>
              {timer > 0 && <p className="text-center mt-2 text-sm">Resend OTP in {timer} seconds</p>}
              {canResend && (
                <button
                  type="button"
                  onClick={requestOtp}
                  className="w-full mt-2 bg-yellow-500 p-2 rounded"
                >
                  Resend OTP
                </button>
              )}
            </>
          )}
        </form>
      )}

      <div className="flex gap-4 mt-4">
        <button onClick={() => handleOAuthLogin("google")} className="bg-red-500 px-4 py-2 rounded">Google</button>
        <button onClick={() => handleOAuthLogin("github")} className="bg-gray-600 px-4 py-2 rounded">GitHub</button>
        <button onClick={() => handleOAuthLogin("linkedin")} className="bg-blue-700 px-4 py-2 rounded">LinkedIn</button>
      </div>

      <button onClick={handleForgotPassword} className="text-yellow-400 mt-4">Forgot Password?</button>

      <p className="mt-4">
        {isOtpLogin ? "Want to login with password?" : "Want to login with OTP?"}
        <button onClick={() => setIsOtpLogin(!isOtpLogin)} className="text-blue-400 ml-2">Switch</button>
      </p>

      <p className="mt-4">
        Don't have an account? <a href="/signup" className="text-blue-400">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;
