// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const GitHubStrategy = require("passport-github2").Strategy;
// const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       let user = await User.findOne({ googleId: profile.id });
//       if (!user) {
//         // If user doesn't exist, create a new one
//         user = await new User({
//           googleId: profile.id,
//           name: profile.displayName,
//           email: profile.emails[0].value,
//         }).save();
//       }

//       // Create JWT token
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

//       // Send token and user data back to frontend
//       done(null, { token, user });
//     }
//   )
// );

// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: "/api/auth/github/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       let user = await User.findOne({ githubId: profile.id });
//       if (!user) {
//         // If user doesn't exist, create a new one
//         user = await new User({ githubId: profile.id, name: profile.displayName }).save();
//       }

//       // Create JWT token
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

//       // Send token and user data back to frontend
//       done(null, { token, user });
//     }
//   )
// );

// passport.use(
//   new LinkedInStrategy(
//     {
//       clientID: process.env.LINKEDIN_CLIENT_ID,
//       clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
//       callbackURL: "/api/auth/linkedin/callback",
//       scope: ["r_liteprofile", "r_emailaddress"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       let user = await User.findOne({ linkedinId: profile.id });
//       if (!user) {
//         // If user doesn't exist, create a new one
//         user = await new User({ linkedinId: profile.id, name: profile.displayName }).save();
//       }

//       // Create JWT token
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

//       // Send token and user data back to frontend
//       done(null, { token, user });
//     }
//   )
// );


const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://shivam-blogs.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // If user doesn't exist, create a new one
        user = await new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        }).save();
      }

      // Create JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

      // Send token and user data back to frontend
      done(null, { token, user });
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://shivam-blogs.onrender.com/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        // If user doesn't exist, create a new one
        user = await new User({ githubId: profile.id, name: profile.displayName }).save();
      }

      // Create JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

      // Send token and user data back to frontend
      done(null, { token, user });
    }
  )
);

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: "https://shivam-blogs.onrender.com/api/auth/linkedin/callback",
      scope: ["r_liteprofile", "r_emailaddress"],
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ linkedinId: profile.id });
      if (!user) {
        // If user doesn't exist, create a new one
        user = await new User({ linkedinId: profile.id, name: profile.displayName }).save();
      }

      // Create JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

      // Send token and user data back to frontend
      done(null, { token, user });
    }
  )
);
