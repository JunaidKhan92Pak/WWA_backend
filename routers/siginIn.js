// Importing necessary modules
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserDb = require("../database/models/UserDb"); // Importing the User database model for user data handling

// POST Route for user login Authentication
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address.",
      success: false,
    });
  }

  try {
    // Find the user in the database
    const user = await UserDb.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials.",
        success: false,
      });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials.",
        success: false,
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY || "defaultSecretKey", // Fallback for missing secret key
      { expiresIn: "1d" }
    );

    // Set token as an HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true, // Prevent client-side access
      sameSite: "strict", // Mitigate CSRF attacks
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    console.log("Sign In Successful");
    return res.status(200).json({
      message: "Sign In Successful",
      success: true,
      token,
      user: user,
    });
  } catch (error) {
    // Log the error and send a generic response
    console.error(
      `[${new Date().toISOString()}] Backend error: ${error.message}`
    );
    return res.status(500).json({
      message: "An internal server error occurred.",
      success: false,
    });
  }
});

module.exports = router;