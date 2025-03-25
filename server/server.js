// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const blogRoutes = require('./routes/blogRoutes');
// const cookieParser = require("cookie-parser");
// const authRoutes = require("./routes/authRoutes");
// const passportSetup = require("./config/passportSetup");



// const app = express();

// // Middleware

// app.use(express.json());
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(cookieParser());

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/blogs', blogRoutes);
// app.use("/api/auth", authRoutes);



// // Database Connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('✅ MongoDB Connected'))
//     .catch(err => console.error('❌ MongoDB Connection Error:', err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const blogRoutes = require('./routes/blogRoutes');
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const passportSetup = require("./config/passportSetup");
const jwt = require('jsonwebtoken');

const app = express();

// Middleware

app.use(express.json());

// CORS configuration (allow credentials and specify frontend URL)
app.use(cors({ 
  origin: "https://st-blogs.vercel.app", // Your frontend URL
  credentials: true,  // Allow cookies to be sent/received
}));

app.use(cookieParser());  // Parse cookies from the request

// Static file serving (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to protect API routes
const authenticateJWT = (req, res, next) => {
    // Extract the token from the Authorization header
    const token = req.header('Authorization')?.split(' ')[1];
  
    if (!token) {
      return res.status(403).json({ message: 'Access denied, no token provided.' });
    }
  
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Attach the decoded user information to the request
      req.user = decoded;
  
      next(); // Allow the request to proceed
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };

// Example protected route
app.get('api/users', authenticateJWT, async (req, res) => {
    try {
      // Fetch the user based on the user ID from the decoded token
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Respond with user data
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error.' });
    }
  });

// Routes
app.use('/api/blogs', blogRoutes);
app.use("/api/auth", authRoutes);

// Example of a protected route (for testing)
app.get('/api/protected', authenticateJWT, (req, res) => {
  res.json({ message: "Protected content", user: req.user });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
