"use strict";

/* ============================================================
   SCAM DETECTOR — backend/config/db.js

   What this file does:
   - Connects our Express server to MongoDB
   - Shows a success message when connection works
   - Shows a clear error and stops the server if it fails

   How it is used:
   - Import connectDB in server.js
   - Call connectDB() before starting the server
   ============================================================ */


/* ============================================================
   SECTION 1 — IMPORT MONGOOSE
   — Mongoose is the library that lets Node.js talk to MongoDB.
   — It provides easy methods to connect, read, and write data.
   ============================================================ */

const mongoose = require("mongoose");


/* ============================================================
   SECTION 2 — connectDB FUNCTION
   — async means this function can use await inside it.
   — await pauses execution until MongoDB responds,
     instead of crashing or moving on too early.
   ============================================================ */

const connectDB = async function () {

  try {

    /* --------------------------------------------------
       STEP 1 — ATTEMPT THE CONNECTION
       — mongoose.connect() opens a connection to MongoDB.
       — process.env.MONGO_URI reads the database URL
         from your .env file.
       — We store the result in "conn" so we can read
         the connected host name from it below.
    -------------------------------------------------- */
    const conn = await mongoose.connect(process.env.MONGO_URI);

    /* --------------------------------------------------
       STEP 2 — SUCCESS MESSAGE
       — conn.connection.host shows which MongoDB server
         we connected to (e.g. localhost or Atlas host).
       — This confirms everything is working correctly.
    -------------------------------------------------- */
    console.log("====================================");
    console.log("  MongoDB Connected Successfully");
    console.log("  Host: " + conn.connection.host);
    console.log("====================================");

  } catch (error) {

    /* --------------------------------------------------
       STEP 3 — ERROR HANDLING
       — If the connection fails for any reason
         (wrong URI, MongoDB not running, network issue),
         we land here inside the catch block.
       — We print the exact error message so it is easy
         to diagnose what went wrong.
       — process.exit(1) shuts the server down completely.
         We do this because a server running without a
         database cannot do anything useful and should
         not pretend to be working.
    -------------------------------------------------- */
    console.error("====================================");
    console.error("  MongoDB Connection Failed");
    console.error("  Error: " + error.message);
    console.error("====================================");
    process.exit(1);

  }

};


/* ============================================================
   SECTION 3 — EXPORT
   — module.exports makes connectDB available to other files.
   — server.js will import and call it like this:
       const connectDB = require("./config/db");
       connectDB();
   ============================================================ */

module.exports = connectDB;