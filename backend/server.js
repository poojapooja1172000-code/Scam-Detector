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
   ============================================================ */

dotenv.config();


/* ============================================================
   4. IMPORT DATABASE AND ROUTES
   ============================================================ */

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const scanRoutes = require("./routes/scanRoutes");


/* ============================================================
   5. INITIALIZE EXPRESS
   ============================================================ */

const app = express();


/* ============================================================
   6. CORS CONFIGURATION
   ============================================================ */

const corsOptions = {
  origin: "https://poojapooja1172000-code.github.io",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));


/* ============================================================
   7. JSON MIDDLEWARE
   ============================================================ */

app.use(express.json());


/* ============================================================
   8. TEST ROUTE
   ============================================================ */

app.get("/", (req, res) => {
  res.json({
    message: "Scam Detector Backend is Running Successfully"
  });
});


/* ============================================================
   9. API ROUTES
   ============================================================ */

app.use("/api/auth", authRoutes);

app.use("/api/scan", scanRoutes);


/* ============================================================
   10. START SERVER
   ============================================================ */

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB();

  app.listen(PORT, () => {
    console.log(
      `Server is running on: http://localhost:${PORT}`
    );
  });
} else {
  connectDB();
}


/* ============================================================
   11. EXPORT APP FOR VERCEL
   ============================================================ */

module.exports = app;