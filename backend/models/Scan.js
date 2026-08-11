"use strict";

/* ============================================================
   SCAM DETECTOR — backend/models/Scan.js

   What this file does:
   - Defines the shape of a Scan document in MongoDB
   - Every time a user analyzes a URL, one Scan document
     gets saved to the "scans" collection
   - Enforces rules on every field (required, enum, min/max)
   - Automatically records when each scan was created

   How it is used:
   - Import Scan in your scan controller like this:
       const Scan = require("../models/Scan");
   - Then save a new scan result:
       await Scan.create({ url, domain, https, status, ... });
   ============================================================ */


/* ============================================================
   SECTION 1 — IMPORT MONGOOSE
   ============================================================ */

const mongoose = require("mongoose");


/* ============================================================
   SECTION 2 — CREATE THE SCHEMA
   ============================================================ */

const scanSchema = new mongoose.Schema(

  {
    /* userId — identifies which user created this scan */
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: [true, "User ID is required"],
},
    /* url — full URL submitted by the user */
    url: {
      type    : String,
      required: [true, "URL is required"],
      trim    : true,
    },

    /* domain — hostname extracted from the URL (e.g. example.com) */
    domain: {
      type    : String,
      required: [true, "Domain is required"],
      trim    : true,
    },

    /* https — true if the URL uses HTTPS, false if HTTP */
    https: {
      type    : Boolean,
      required: [true, "HTTPS status is required"],
    },

    /* status — final verdict, restricted to three allowed values */
    status: {
      type    : String,
      required: [true, "Status is required"],
      enum    : {
        values : ["SAFE", "SUSPICIOUS", "SCAM"],
        message: "Status must be SAFE, SUSPICIOUS, or SCAM",
      },
    },

    /* riskScore — numeric score 0-100 calculated by heuristics */
    riskScore: {
      type    : Number,
      required: [true, "Risk score is required"],
      min     : [0,   "Risk score cannot be less than 0"],
      max     : [100, "Risk score cannot exceed 100"],
    },

    /* reasons — array of plain-English explanations for each flag */
    reasons: {
      type   : [String],
      default: [],
    },

    /* scannedAt — exact timestamp when this URL was scanned */
    scannedAt: {
      type   : Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }

);


/* ============================================================
   SECTION 3 — CREATE THE MODEL
   — "Scan" → MongoDB collection will be named "scans"
   ============================================================ */

const Scan = mongoose.model("Scan", scanSchema);


/* ============================================================
   SECTION 4 — EXPORT THE MODEL
   ============================================================ */

module.exports = Scan;