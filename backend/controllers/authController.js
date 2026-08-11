"use strict";

/* ============================================================
   SCAM DETECTOR — backend/controllers/authController.js

   This file contains the logic for user registration.
   It checks whether the email already exists and then
   saves the new user in MongoDB.
   ============================================================ */

const User = require("../models/User");
const bcrypt = require("bcrypt"); 

/* ============================================================
   REGISTER USER
   Endpoint: POST /api/auth/register
   ============================================================ */

const registerUser = async function (req, res) {
  try {
    // Get the registration details sent by the frontend
    const { name, email, password } = req.body;

    // Check that all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
      });
    }

    // Convert the email to lowercase for consistent checking
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether a user with this email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Send a success response
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Register user error:", error.message);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* ============================================================
   LOGIN USER
   Endpoint: POST /api/auth/login
   ============================================================ */

const loginUser = async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login user error:", error.message);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
};