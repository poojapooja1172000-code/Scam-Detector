"use strict";

/* ============================================================
   SCAM DETECTOR — server.js
   Project : Scam Detector (Educational)

   This is the main entry point of the backend server.
   It currently:
   - Sets up Express
   - Enables CORS so the frontend can talk to this server
   - Reads environment variables using dotenv
   - Connects to the database
   - Parses incoming JSON request bodies
   - Exposes a simple test route (GET /)
   - Connects the authentication routes (/api/auth)
   ============================================================ */


/* ============================================================
   1. IMPORTS
   Bring in the packages and files this server needs.
   ============================================================ */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const scanRoutes = require("./routes/scanRoutes");


/* ============================================================
   2. LOAD ENVIRONMENT VARIABLES
   Reads values from a .env file (like PORT and the database
   connection string) into process.env.
   Must run before we use process.env anywhere below.
   ============================================================ */
dotenv.config();


/* ============================================================
   3. CONNECT TO THE DATABASE
   Calls the connectDB function (defined in config/db.js) to
   open a connection to MongoDB before the server starts
   handling requests.
   ============================================================ */
connectDB();


/* ============================================================
   4. INITIALIZE EXPRESS
   Creates the main app object we'll use to configure
   middleware and routes.
   ============================================================ */
const app = express();


/* ============================================================
   5. PORT CONFIGURATION
   Uses the PORT value from the .env file if it exists,
   otherwise falls back to 5000 during local development.
   ============================================================ */
const PORT = process.env.PORT || 5000;


/* ============================================================
   6. MIDDLEWARE
   Code that runs on every incoming request, before it
   reaches our routes.

   - cors()          → allows the frontend (running on a
                        different origin/port) to make
                        requests to this backend.
   - express.json()  → allows the server to understand JSON
                        data sent in request bodies.
   ============================================================ */
app.use(cors());
app.use(express.json());


/* ============================================================
   7. TEST ROUTE
   A simple route to confirm the server is running.
   Visiting http://localhost:5000/ in a browser (or Postman)
   should return this JSON message.
   ============================================================ */
app.get("/", (req, res) => {
  res.json({ message: "Scam Detector Backend is Running Successfully" });
});


/* ============================================================
   8. ROUTES
   Connects the authentication routes to the app.
   Every route inside authRoutes.js (like POST /register) is
   now reachable under the "/api/auth" prefix.

   Example: POST /register (defined in authRoutes.js)
   becomes: POST /api/auth/register
   ============================================================ */
app.use("/api/auth", authRoutes);
app.use("/api/scan", scanRoutes);


/* ============================================================
   9. START THE SERVER
   Tells Express to start listening for requests on the
   configured PORT, and logs a friendly message once it's
   ready.
   ============================================================ */
app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});