"use strict";

/* ============================================================
   SCAM DETECTOR — backend/routes/authRoutes.js

   Authentication routes:
   - Register
   - Login
   - Forgot Password
   - Verify OTP
   - Reset Password
   ============================================================ */


/* ============================================================
   1. IMPORTS
   ============================================================ */

const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require("../controllers/authController");


/* ============================================================
   2. CREATE ROUTER
   ============================================================ */

const router = express.Router();


/* ============================================================
   3. AUTHENTICATION ROUTES
   ============================================================ */


/*
   Register User

   POST /api/auth/register
*/
router.post("/register", registerUser);


/*
   Login User

   POST /api/auth/login
*/
router.post("/login", loginUser);


/*
   Forgot Password

   POST /api/auth/forgot-password

   Request body:

   {
     "email": "user@example.com"
   }
*/
router.post("/forgot-password", forgotPassword);


/*
   Verify OTP

   POST /api/auth/verify-otp

   Request body:

   {
     "email": "user@example.com",
     "otp": "482731"
   }
*/
router.post("/verify-otp", verifyOTP);


/*
   Reset Password

   POST /api/auth/reset-password

   Request body:

   {
     "email": "user@example.com",
     "otp": "482731",
     "newPassword": "newpassword123"
   }
*/
router.post("/reset-password", resetPassword);


/* ============================================================
   4. EXPORT ROUTER
   ============================================================ */

module.exports = router;