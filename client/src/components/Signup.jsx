import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // Step to control form display
  const [timer, setTimer] = useState(0); // Countdown timer for resend OTP
  const [canResend, setCanResend] = useState(false); // Flag to control resend button visibility
  const [isLoading, setIsLoading] = useState(false); // Flag for loading state
  const navigate = useNavigate();

  // Handle form submission for Signup (Step 1)
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      await axios.post("http://localhost:5000/api/auth/signup", form);
      toast.info("OTP sent to your email");
      setStep(2); // Move to OTP verification step
      startTimer(); // Start the countdown timer
       localStorage.setItem("token", res.data.token);
            toast.success("Login successful!");
            navigate("/");
    } catch (err) {
      toast.error(err.response.data.message || "Signup failed");
    } finally {
      setIsLoading(false); // End loading
    }
  };


  // Start countdown timer for OTP resend
  const startTimer = () => {
    let countdown = 60; // 1 minute countdown
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

  // Handle OTP verification (Step 2)
  const verifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-signup-otp", { email: form.email, otp });
      
      // Save the token to localStorage after OTP verification
      localStorage.setItem("token", res.data.token);

      toast.success("Signup and Login successful!");
      navigate("/"); // Redirect to home after successful signup
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false); // End loading
    }
  };



  // Handle OTP resend
  const resendOtp = async () => {
    setIsLoading(true); // Show loading state
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", { email: form.email });
      toast.info("OTP resent to your email");
      setTimer(60); // Reset timer to 60 seconds
      setCanResend(false); // Disable resend button again
      startTimer(); // Restart countdown
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-4">{step === 1 ? "Sign Up" : "Verify OTP"}</h2>

      {/* Step 1: Sign Up Form */}
      {step === 1 ? (
        <form onSubmit={handleSignup} className="bg-gray-800 p-6 rounded-lg w-80">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 mb-3 bg-gray-700 text-white rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-2 mb-3 bg-gray-700 text-white rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-2 mb-3 bg-gray-700 text-white rounded"
            required
          />
          <button
            type="submit"
            className={`w-full bg-green-500 p-2 rounded ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        // Step 2: OTP Verification Form
        <div className="bg-gray-800 p-6 rounded-lg w-80">
          <form onSubmit={verifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 mb-3 bg-gray-700 text-white rounded"
              required
            />
            <button type="submit" className="w-full bg-blue-500 p-2 rounded">Verify OTP</button>
          </form>

          {/* Timer Display */}
          <div className="text-center mt-2">
            {timer > 0 ? (
              <p className="text-sm text-gray-400">Resend OTP in {timer} seconds</p>
            ) : (
              <button
                type="button"
                onClick={resendOtp}
                className="w-full bg-yellow-500 p-2 rounded mt-2"
                disabled={!canResend || isLoading}
              >
                {isLoading ? "Resending..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
