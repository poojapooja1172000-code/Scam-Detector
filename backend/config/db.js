"use strict";

/* ============================================================
   SCAM DETECTOR — backend/config/db.js
   MongoDB connection configuration
   ============================================================ */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in the .env file");
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log("====================================");
    console.log("  MongoDB Connected Successfully");
    console.log("  Host: " + conn.connection.host);
    console.log("====================================");

  } catch (error) {
    console.error("====================================");
    console.error("  MongoDB Connection Failed");
    console.error("  Error Name: " + error.name);
    console.error("  Error Message: " + error.message);

    if (error.reason) {
      console.error("  Connection Reason:");
      console.error(error.reason);
    }

    console.error("====================================");

    process.exit(1);
  }
};

module.exports = connectDB;