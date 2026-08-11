"use strict";

/* ============================================================
   SCAM DETECTOR — backend/routes/scanRoutes.js

   What this file does:
   - Creates all scan-related API routes
   - Connects each route to its controller function

   Available Routes:
   POST   /api/scan/analyze
   GET    /api/scan/history
   GET    /api/scan/:id
   DELETE /api/scan/:id
   ============================================================ */


/* ============================================================
   SECTION 1 — IMPORTS
   ============================================================ */

const express = require("express");

const router = express.Router();

const {
  analyzeURL,
  getScanHistory,
  getScanById,
  deleteScan,
} = require("../controllers/scanController");


/* ============================================================
   SECTION 2 — ROUTES
   ============================================================ */

/*
   Analyze a URL
   POST /api/scan/analyze
*/
router.post("/analyze", analyzeURL);


/*
   Get logged-in user's scan history
   GET /api/scan/history?userId=...
*/
router.get("/history", getScanHistory);


/*
   Get one scan belonging to the user
   GET /api/scan/:id?userId=...
*/
router.get("/:id", getScanById);


/*
   Delete one scan belonging to the user
   DELETE /api/scan/:id?userId=...
*/
router.delete("/:id", deleteScan);


/* ============================================================
   SECTION 3 — EXPORT ROUTER
   ============================================================ */

module.exports = router;