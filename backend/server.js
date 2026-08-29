"use strict";

/* ============================================================
   SCAM DETECTOR — server.js
   Project : Scam Detector (Educational)
   ============================================================ */


/* ============================================================
   1. DNS CONFIGURATION
   ============================================================ */

const dns = require("dns");

dns.setServers(["8.8.8.8"]);


/* ============================================================
   2. IMPORTS
   ============================================================ */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


/* ============================================================
   3. LOAD ENVIRONMENT VARIABLES
   IMPORTANT:
   This must happen BEFORE importing routes/controllers
   that use process.env.
   ============================================================ */

dotenv.config();


/* ============================================================
   4. IMPORT DATABASE AND ROUTES
   ============================================================ */

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const scanRoutes = require("./routes/scanRoutes");


/* ============================================================
   5. CONNECT TO DATABASE
   ============================================================ */

connectDB();


/* ============================================================
   6. INITIALIZE EXPRESS
   ============================================================ */

const app = express();


/* ============================================================
   7. PORT
   ============================================================ */

const PORT = process.env.PORT || 5000;


/* ============================================================
   8. MIDDLEWARE
   ============================================================ */

app.use(cors());

app.use(express.json());


/* ============================================================
   9. TEST ROUTE
   ============================================================ */

app.get("/", (req, res) => {
  res.json({
    message: "Scam Detector Backend is Running Successfully",
  });
});


/* ============================================================
   10. ROUTES
   ============================================================ */

app.use("/api/auth", authRoutes);

app.use("/api/scan", scanRoutes);


/* ============================================================
   11. START SERVER
   ============================================================ */

app.listen(PORT, () => {
  console.log(
    `Server is running on: http://localhost:${PORT}`
  );
});