"use strict";

/* ============================================================
   SCAM DETECTOR — authController.js

   Handles:
   - Register user
   - Login user
   - Forgot password
   - Generate OTP
   - Send OTP through Gmail
   - Verify OTP
   - Reset password
   ============================================================ */

const dotenv = require("dotenv");
dotenv.config();

const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");


/* ============================================================
   1. GMAIL SMTP CONFIGURATION
   ============================================================ */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});


/* ============================================================
   2. REGISTER USER
   POST /api/auth/register
   ============================================================ */

const registerUser = async function (req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

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
    console.error("Register user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


/* ============================================================
   3. LOGIN USER
   POST /api/auth/login
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

    /* --------------------------------------------------------
       Compare entered password with stored bcrypt hash
       -------------------------------------------------------- */

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    /* --------------------------------------------------------
       Successful login
       -------------------------------------------------------- */

    return res.status(200).json({
      message: "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


/* ============================================================
   4. FORGOT PASSWORD
   POST /api/auth/forgot-password

   Flow:

   User enters email
          ↓
   Find account
          ↓
   Generate 6-digit OTP
          ↓
   Save OTP to MongoDB
          ↓
   OTP expires after 10 minutes
          ↓
   Send OTP through Gmail
   ============================================================ */

const forgotPassword = async function (req, res) {
  try {

    const { email } = req.body;


    /* --------------------------------------------------------
       CHECK EMAIL
       -------------------------------------------------------- */

    if (!email) {
      return res.status(400).json({
        message: "Please provide your email address",
      });
    }


    const normalizedEmail = email.trim().toLowerCase();


    /* --------------------------------------------------------
       FIND USER
       -------------------------------------------------------- */

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address",
      });
    }


    /* --------------------------------------------------------
       CHECK EMAIL CONFIGURATION
       -------------------------------------------------------- */

    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_APP_PASSWORD
    ) {

      console.error(
        "EMAIL_USER or EMAIL_APP_PASSWORD is missing in .env"
      );

      return res.status(500).json({
        message: "Email service is not configured correctly",
      });
    }


    /* --------------------------------------------------------
       GENERATE 6-DIGIT OTP
       -------------------------------------------------------- */

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();


    /* --------------------------------------------------------
       OTP EXPIRATION
       10 MINUTES
       -------------------------------------------------------- */

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );


    /* --------------------------------------------------------
       SAVE OTP
       -------------------------------------------------------- */

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = otpExpiry;

    await user.save();


    /* --------------------------------------------------------
       EMAIL CONTENT
       -------------------------------------------------------- */

    const mailOptions = {

      from: `"Scam Detector" <${process.env.EMAIL_USER}>`,

      to: normalizedEmail,

      subject: "Scam Detector - Password Reset OTP",

      text: `Hello ${user.name},

Your Scam Detector password reset OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not request a password reset, please ignore this email.

Regards,
Scam Detector Team`,
    };


    /* --------------------------------------------------------
       SEND EMAIL
       -------------------------------------------------------- */

    console.log(
      "Sending password reset OTP to:",
      normalizedEmail
    );

    await transporter.sendMail(mailOptions);


    /* --------------------------------------------------------
       SUCCESS
       -------------------------------------------------------- */

    console.log(
      "OTP email sent successfully to:",
      normalizedEmail
    );

    return res.status(200).json({
      message: "OTP sent successfully to your email",
      expiresAt: otpExpiry,
    });


  } catch (error) {

    console.error(
      "Forgot password email error:",
      error
    );

    return res.status(500).json({
      message: "Unable to send OTP",
    });
  }
};


/* ============================================================
   5. VERIFY OTP
   POST /api/auth/verify-otp
   ============================================================ */

const verifyOTP = async function (req, res) {

  try {

    const { email, otp } = req.body;


    /* --------------------------------------------------------
       VALIDATE INPUT
       -------------------------------------------------------- */

    if (!email || !otp) {

      return res.status(400).json({
        message: "Please provide email and OTP",
        verified: false,
      });
    }


    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedOTP =
      otp.trim();


    /* --------------------------------------------------------
       VALIDATE OTP FORMAT
       -------------------------------------------------------- */

    if (!/^\d{6}$/.test(normalizedOTP)) {

      return res.status(400).json({
        message: "OTP must contain 6 digits",
        verified: false,
      });
    }


    /* --------------------------------------------------------
       FIND USER WITH VALID OTP
       -------------------------------------------------------- */

    const user = await User.findOne({

      email: normalizedEmail,

      resetPasswordOTP: normalizedOTP,

      resetPasswordOTPExpires: {
        $gt: new Date(),
      },

    });


    /* --------------------------------------------------------
       INVALID OR EXPIRED OTP
       -------------------------------------------------------- */

    if (!user) {

      return res.status(400).json({
        message: "Invalid or expired OTP",
        verified: false,
      });
    }


    /* --------------------------------------------------------
       OTP VERIFIED
       -------------------------------------------------------- */

    return res.status(200).json({

      message: "OTP verified successfully",

      verified: true,

    });


  } catch (error) {

    console.error(
      "Verify OTP error:",
      error
    );

    return res.status(500).json({

      message: "Server error",

      verified: false,

    });
  }
};


/* ============================================================
   6. RESET PASSWORD
   POST /api/auth/reset-password
   ============================================================ */

const resetPassword = async function (req, res) {

  try {

    const {
      email,
      otp,
      newPassword,
    } = req.body;


    /* --------------------------------------------------------
       VALIDATE INPUT
       -------------------------------------------------------- */

    if (!email || !otp || !newPassword) {

      return res.status(400).json({

        message:
          "Please provide email, OTP, and new password",

      });
    }


    /* --------------------------------------------------------
       PASSWORD LENGTH
       -------------------------------------------------------- */

    if (newPassword.length < 6) {

      return res.status(400).json({

        message:
          "New password must be at least 6 characters long",

      });
    }


    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedOTP =
      otp.trim();


    /* --------------------------------------------------------
       FIND USER WITH VALID OTP
       -------------------------------------------------------- */

    const user = await User.findOne({

      email: normalizedEmail,

      resetPasswordOTP: normalizedOTP,

      resetPasswordOTPExpires: {
        $gt: new Date(),
      },

    });


    /* --------------------------------------------------------
       INVALID OTP
       -------------------------------------------------------- */

    if (!user) {

      return res.status(400).json({

        message:
          "Invalid or expired OTP",

      });
    }


    /* --------------------------------------------------------
       HASH NEW PASSWORD
       -------------------------------------------------------- */

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);


    /* --------------------------------------------------------
       UPDATE PASSWORD
       -------------------------------------------------------- */

    user.password =
      hashedPassword;


    /* --------------------------------------------------------
       CLEAR OTP
       -------------------------------------------------------- */

    user.resetPasswordOTP =
      null;

    user.resetPasswordOTPExpires =
      null;


    /* --------------------------------------------------------
       SAVE USER
       -------------------------------------------------------- */

    await user.save();


    /* --------------------------------------------------------
       SUCCESS
       -------------------------------------------------------- */

    return res.status(200).json({

      message:
        "Password reset successfully",

    });


  } catch (error) {

    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({

      message:
        "Server error",

    });
  }
};


/* ============================================================
   7. EXPORT CONTROLLERS
   ============================================================ */

module.exports = {

  registerUser,

  loginUser,

  forgotPassword,

  verifyOTP,

  resetPassword,

};