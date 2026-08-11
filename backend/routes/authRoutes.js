"use strict";

/* ============================================================
   SCAM DETECTOR — authRoutes.js
   Defines the URL paths (routes) related to authentication.
   Right now this only handles user registration.
   ============================================================ */


/* ============================================================
   1. IMPORTS
   ============================================================ */

// Express is needed to create a Router
const express = require("express");

// registerUser is the function that actually creates a new
// user in the database — it lives in authController.js
const {
  registerUser,
  loginUser,
} = require("../controllers/authController");


/* ============================================================
   2. CREATE THE ROUTER
   A Router is like a mini version of the app that only
   handles routes related to authentication. server.js will
   later plug this router into the main app.
   ============================================================ */
const router = express.Router();


/* ============================================================
   3. ROUTES
   ============================================================ */

// POST /register
// When the frontend sends a POST request to /register
// (with name, email, and password in the request body),
// this route hands the request off to registerUser to
// actually create the new account.
router.post("/register", registerUser);
router.post("/login", loginUser);



/* ============================================================
   4. EXPORT THE ROUTER
   Makes this router available to server.js (or any other
   file) so it can be plugged into the main Express app.
   ============================================================ */
module.exports = router;