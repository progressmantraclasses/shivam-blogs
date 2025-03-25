import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token") || localStorage.getItem("token"); 
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
  
        // Store token in localStorage if not already stored
        if (!localStorage.getItem("token")) {
          localStorage.setItem("token", token);
        }
  
        // Remove token from URL for security
        window.history.replaceState({}, document.title, "/dashboard");
      } catch (error) {
        console.error("❌ Invalid token:", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    } else {
      console.warn("❌ No token found!");
      navigate("/");
    }
  }, [navigate]);
  

  const fetchUserDetails = async (userId) => {
    try {
      const res = await axios.get(`https://shivam-blogs.onrender.com/api/users/${_Id}`);
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-4">Welcome to Dashboard</h2>

      {user ? (
        <>
          <p className="mb-4">User ID: <strong>{user._id}</strong></p>
          <p className="mb-4">Name: {user.name || "N/A"}</p>
          <p className="mb-4">Email: {user.email || "N/A"}</p>
          <p className="mb-4">Role: {user.role || "N/A"}</p>
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
            Logout
          </button>
        </>
      ) : (
        <p className="mb-4">User not logged in</p>
      )}
    </div>
  );
};

export default Dashboard;
