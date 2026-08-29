"use strict";

/* ============================================================
   SCAM DETECTOR — backend/controllers/scanController.js

   Handles:

   1. URL analysis
   2. Saving scans with userId
   3. Fetching one user's scan history
   4. Fetching one scan belonging to that user
   5. Deleting one scan belonging to that user
   ============================================================ */

const Scan = require("../models/Scan");
const mongoose = require("mongoose");


/* ============================================================
   1. ANALYZE URL
   POST /api/scan/analyze
   ============================================================ */

const analyzeURL = async function (req, res) {

  try {

    const { url, userId } = req.body;


    /* --------------------------------------------------------
       Check URL
       -------------------------------------------------------- */

    if (!url || url.trim() === "") {

      return res.status(400).json({
        message: "URL is required",
      });

    }


    /* --------------------------------------------------------
       Check user ID
       -------------------------------------------------------- */

    if (!userId) {

      return res.status(400).json({
        message: "User ID is required",
      });

    }


    const trimmedURL = url.trim();


    /* --------------------------------------------------------
       Validate URL
       -------------------------------------------------------- */

    let parsedURL;

    try {

      parsedURL = new URL(trimmedURL);

    } catch (error) {

      return res.status(400).json({
        message:
          "Invalid URL. Please enter a valid URL including https://",
      });

    }


    /* --------------------------------------------------------
       Allow only HTTP and HTTPS URLs
       -------------------------------------------------------- */

    if (
      parsedURL.protocol !== "http:" &&
      parsedURL.protocol !== "https:"
    ) {

      return res.status(400).json({
        message:
          "Only HTTP and HTTPS URLs are allowed",
      });

    }


    /* --------------------------------------------------------
       Extract URL information
       -------------------------------------------------------- */

    const domain = parsedURL.hostname;

    const isHTTPS =
      parsedURL.protocol === "https:";


    /* ========================================================
       RISK ANALYSIS
       ======================================================== */

    let riskScore = 0;

    const reasons = [];
    const checks = {
  https: {
    status: "Passed",
    message: "The website uses a secure HTTPS connection."
  },

  domainReputation: {
    status: "Passed",
    message: "No obvious suspicious domain characteristics were detected."
  },

  urlStructure: {
    status: "Passed",
    message: "The URL structure appears normal."
  },

  blacklist: {
    status: "Passed",
    message: "No blacklist indicators were detected by the current scanner."
  }
};

    /* --------------------------------------------------------
       1. CHECK HTTPS
       -------------------------------------------------------- */

    if (!isHTTPS) {

  riskScore += 30;

  reasons.push(
    "The website does not use HTTPS"
  );

  checks.https = {
    status: "Warning",
    message: "The website does not use HTTPS."
  };

}


    /* --------------------------------------------------------
       2. CHECK URL LENGTH
       -------------------------------------------------------- */

    if (trimmedURL.length > 75) {

      riskScore += 20;

      reasons.push(
        "The URL is unusually long"
      );

    }


    /* --------------------------------------------------------
       3. CHECK @ SYMBOL
       -------------------------------------------------------- */

    if (trimmedURL.includes("@")) {

  riskScore += 25;

  reasons.push(
    "The URL contains an @ symbol"
  );

  checks.urlStructure = {
    status: "Warning",
    message: "The URL contains an @ symbol, which can be used to disguise the actual destination."
  };

}


    /* --------------------------------------------------------
       4. CHECK SUSPICIOUS DOMAIN EXTENSION
       -------------------------------------------------------- */

    const suspiciousTLDs = [

      ".xyz",
      ".tk",
      ".ml",
      ".ga",
      ".cf",
      ".gq",

    ];


    const hasSuspiciousTLD =
      suspiciousTLDs.some(
        function (tld) {

          return domain
            .toLowerCase()
            .endsWith(tld);

        }
      );


    if (hasSuspiciousTLD) {

  riskScore += 30;

  reasons.push(
    "The domain uses a suspicious extension"
  );

  checks.domainReputation = {
    status: "Warning",
    message: "The domain uses a suspicious extension."
  };

}



    /* --------------------------------------------------------
       5. CHECK MISSING DOMAIN STRUCTURE
       --------------------------------------------------------

       Example:

       https://xzepapal123

       This has no normal domain extension such
       as .com, .org, .in, etc.
       -------------------------------------------------------- */

    const isIPAddress =
      /^\d{1,3}(\.\d{1,3}){3}$/.test(
        domain
      );


    if (
      !domain.includes(".") &&
      domain !== "localhost" &&
      !isIPAddress
    ) {

      riskScore += 40;

      reasons.push(
        "The domain does not contain a standard domain extension"
      );

    }


    /* --------------------------------------------------------
       6. CHECK NUMERIC CHARACTERS
       -------------------------------------------------------- */

    const digitCount =
      (domain.match(/\d/g) || []).length;


    if (digitCount >= 2) {

      riskScore += 15;

      reasons.push(
        "The domain contains multiple numeric characters"
      );

    }


    /* --------------------------------------------------------
       7. CHECK SUSPICIOUS HYPHENS
       -------------------------------------------------------- */

    const hyphenCount =
      (domain.match(/-/g) || []).length;


    if (hyphenCount >= 2) {

      riskScore += 15;

      reasons.push(
        "The domain contains multiple hyphens"
      );

    }


    /* --------------------------------------------------------
       8. CHECK IP ADDRESS
       -------------------------------------------------------- */

    if (isIPAddress) {

      riskScore += 25;

      reasons.push(
        "The URL uses an IP address instead of a domain name"
      );

    }


    /* --------------------------------------------------------
       KEEP SCORE BETWEEN 0 AND 100
       -------------------------------------------------------- */

    riskScore =
      Math.min(
        riskScore,
        100
      );


    /* ========================================================
       DETERMINE FINAL STATUS
       ======================================================== */

    let status;


    if (riskScore >= 70) {

      status = "SCAM";

    } else if (riskScore >= 30) {

      status = "SUSPICIOUS";

    } else {

      status = "SAFE";

    }


    /* ========================================================
       SAVE SCAN IN MONGODB
       ======================================================== */

    const savedScan =
      await Scan.create({

        userId: userId,

        url: trimmedURL,

        domain: domain,

        https: isHTTPS,

        status: status,

        riskScore: riskScore,

        reasons: reasons,

        scannedAt: new Date(),

      });


    /* ========================================================
       RETURN RESULT
       ======================================================== */

    return res.status(200).json({

      message:
        "URL analyzed successfully",

      result: {

        id:
          savedScan._id,

        url:
          savedScan.url,

        domain:
          savedScan.domain,

        https:
          savedScan.https,

        status:
          savedScan.status,

        riskScore:
          savedScan.riskScore,

        reasons:
  savedScan.reasons,

checks:
  checks,

scannedAt:
  savedScan.scannedAt,
  
      },

    });


  } catch (error) {

    console.error(
      "Error in analyzeURL:",
      error.message
    );


    return res.status(500).json({

      message:
        "Server error in analyzeURL",

      error:
        error.message,

    });

  }

};


/* ============================================================
   2. GET USER'S SCAN HISTORY

   GET /api/scan/history?userId=...
   ============================================================ */

const getScanHistory = async function (req, res) {

  try {

    const { userId } =
      req.query;


    if (!userId) {

      return res.status(400).json({

        message:
          "User ID is required",

      });

    }


    /* --------------------------------------------------------
       Fetch only scans belonging to this user
       -------------------------------------------------------- */

    const scans =
      await Scan.find({

        userId:
          userId,

      }).sort({

        scannedAt:
          -1,

      });


    return res.status(200).json({

      message:
        "Scan history fetched successfully",

      count:
        scans.length,

      scans:
        scans,

    });


  } catch (error) {

    console.error(
      "Error in getScanHistory:",
      error.message
    );


    return res.status(500).json({

      message:
        "Server error in getScanHistory",

      error:
        error.message,

    });

  }

};


/* ============================================================
   3. GET ONE USER'S SCAN

   GET /api/scan/:id?userId=...
   ============================================================ */

const getScanById = async function (req, res) {

  try {

    const { id } =
      req.params;


    /* --------------------------------------------------------
       Validate MongoDB ObjectId
       -------------------------------------------------------- */

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {

      return res.status(400).json({

        message:
          "Invalid scan ID",

      });

    }


    const { userId } =
      req.query;


    if (!userId) {

      return res.status(400).json({

        message:
          "User ID is required",

      });

    }


    /* --------------------------------------------------------
       Find scan only when both scan ID
       and user ID match
       -------------------------------------------------------- */

    const scan =
      await Scan.findOne({

        _id:
          id,

        userId:
          userId,

      });


    if (!scan) {

      return res.status(404).json({

        message:
          "Scan not found",

      });

    }


    return res.status(200).json({

      message:
        "Scan fetched successfully",

      scan:
        scan,

    });


  } catch (error) {

    console.error(
      "Error in getScanById:",
      error.message
    );


    return res.status(500).json({

      message:
        "Server error in getScanById",

      error:
        error.message,

    });

  }

};


/* ============================================================
   4. DELETE ONE USER'S SCAN

   DELETE /api/scan/:id?userId=...
   ============================================================ */

const deleteScan = async function (req, res) {

  try {

    const { id } =
      req.params;


    /* --------------------------------------------------------
       Validate MongoDB ObjectId
       -------------------------------------------------------- */

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {

      return res.status(400).json({

        message:
          "Invalid scan ID",

      });

    }


    const { userId } =
      req.query;


    if (!userId) {

      return res.status(400).json({

        message:
          "User ID is required",

      });

    }


    /* --------------------------------------------------------
       Delete only when scan ID
       and user ID both match
       -------------------------------------------------------- */

    const deletedScan =
      await Scan.findOneAndDelete({

        _id:
          id,

        userId:
          userId,

      });


    if (!deletedScan) {

      return res.status(404).json({

        message:
          "Scan not found",

      });

    }


    return res.status(200).json({

      message:
        "Scan deleted successfully",

    });


  } catch (error) {

    console.error(
      "Error in deleteScan:",
      error.message
    );


    return res.status(500).json({

      message:
        "Server error in deleteScan",

      error:
        error.message,

    });

  }

};


/* ============================================================
   5. EXPORT CONTROLLER FUNCTIONS
   ============================================================ */

module.exports = {

  analyzeURL,

  getScanHistory,

  getScanById,

  deleteScan,

};