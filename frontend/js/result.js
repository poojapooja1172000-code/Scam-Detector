"use strict";

/* ============================================================
   SCAM DETECTOR — frontend/js/result.js

   Handles:
   1. Login protection
   2. Dynamic navbar
   3. Logout
   4. Reading latest scan result
   5. Displaying URL
   6. Displaying domain
   7. Displaying HTTPS status
   8. Displaying scan time
   9. Displaying SAFE / SUSPICIOUS / SCAM
   10. Displaying risk score
   11. Updating risk progress bar
   12. Updating detection details
   13. Updating recommendation
   14. Action buttons
   15. Mobile navigation
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ============================================================
     1. LOGIN PROTECTION
     ============================================================ */

  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    alert("Please log in to view scan results.");
    window.location.href = "login.html";
    return;
  }


  /* ============================================================
     2. GET HTML ELEMENTS
     ============================================================ */

  const elScannedUrl =
    document.getElementById("scannedUrl");

  const elScannedDomain =
    document.getElementById("scannedDomain");

  const elHttpsStatus =
    document.getElementById("httpsStatus");

  const elScanTime =
    document.getElementById("scanTime");

  const elResultStatus =
    document.getElementById("resultStatus");

  const elResultHeading =
    document.getElementById("resultHeading");

  const elResultDescription =
    document.querySelector(
      ".result-status-card__description"
    );

  const elRiskScore =
    document.getElementById("riskScore");

  const elRiskScoreFill =
    document.getElementById("riskScoreFill");

  const elRecommendation =
    document.getElementById("recommendationText");

  const elAnalyzeAnotherBtn =
    document.getElementById("analyzeAnotherBtn");

  const elGoHistoryBtn =
    document.getElementById("goHistoryBtn");

  const hamburgerBtn =
    document.querySelector(".nav-toggle");

  const navMenu =
    document.querySelector(".nav-links");


  /* ============================================================
     3. READ SCAN RESULT FROM LOCAL STORAGE
     ============================================================ */

  const storedScanResult =
    localStorage.getItem("latestScanResult");

  let scanResult = null;

  try {

    scanResult = storedScanResult
      ? JSON.parse(storedScanResult)
      : null;

  } catch (error) {

    console.error(
      "Could not read latest scan result:",
      error
    );

  }


  /* ============================================================
     4. CHECK SCAN DATA
     ============================================================ */

  if (!scanResult) {

    alert(
      "No scan result found. Please scan a URL from the Home page first."
    );

    window.location.href = "index.html";

    return;
  }


  /* ============================================================
     5. NORMALIZE URL
     ============================================================ */

  function normalizeURL(value) {

    if (!value) {
      return "";
    }

    let url = String(value).trim();

    /*
      Fix accidental duplicate protocols.

      Example:
      https://http://example.com
      becomes:
      https://example.com
    */

    url = url.replace(
      /^(https?:\/\/)(https?:\/\/)+/i,
      "$1"
    );

    return url;
  }


  const displayURL =
    normalizeURL(
      scanResult.url ||
      localStorage.getItem("lastScannedURL")
    );


  /* ============================================================
     6. GET DOMAIN
     ============================================================ */

  function getDomainFromURL(url) {

    if (!url) {
      return "Unknown";
    }

    try {

      const parsedURL =
        new URL(url);

      return parsedURL.hostname || "Unknown";

    } catch (error) {

      try {

        const cleaned =
          url.replace(
            /^(https?:\/\/)/i,
            ""
          );

        return cleaned
          .split("/")[0]
          .split(":")[0] || "Unknown";

      } catch (fallbackError) {

        return "Unknown";

      }

    }
  }


  const displayDomain =
    scanResult.domain ||
    getDomainFromURL(displayURL);


  /* ============================================================
     7. ESCAPE HTML
     ============================================================ */

  function escapeHtml(text) {

    const div =
      document.createElement("div");

    div.textContent =
      text === undefined ||
      text === null
        ? ""
        : String(text);

    return div.innerHTML;
  }


  /* ============================================================
     8. DYNAMIC NAVBAR
     ============================================================ */

  function updateNavbar() {

    if (!navMenu) {
      return;
    }

    const loggedInUser =
      localStorage.getItem("loggedInUser") ||
      "User";

    navMenu.innerHTML = `

      <li>
        <a
          href="index.html"
          class="nav-link"
        >
          Home
        </a>
      </li>

      <li>
        <a
          href="history.html"
          class="nav-link"
        >
          History
        </a>
      </li>

      <li>
        <span class="nav-link">
          Hi, ${escapeHtml(loggedInUser)}
        </span>
      </li>

      <li>
        <button
          type="button"
          id="logoutBtn"
          class="nav-link nav-link--register"
        >
          Logout
        </button>
      </li>

    `;


    const logoutBtn =
      document.getElementById("logoutBtn");


    if (logoutBtn) {

      logoutBtn.addEventListener(
        "click",
        logoutUser
      );

    }

  }


  /* ============================================================
     9. LOGOUT
     ============================================================ */

  function logoutUser() {

    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem(
      "loggedInUser"
    );

    localStorage.removeItem(
      "loggedInEmail"
    );

    localStorage.removeItem(
      "loggedInUserId"
    );

    alert(
      "Logged out successfully."
    );

    window.location.href =
      "login.html";
  }


  /* ============================================================
     10. DISPLAY URL
     ============================================================ */

  function showURL() {

    if (!elScannedUrl) {
      return;
    }

    elScannedUrl.textContent =
      displayURL || "Unknown";
  }


  /* ============================================================
     11. DISPLAY DOMAIN
     ============================================================ */

  function showDomain() {

    if (!elScannedDomain) {
      return;
    }

    elScannedDomain.textContent =
      displayDomain;
  }


  /* ============================================================
     12. DISPLAY HTTPS STATUS
     ============================================================ */

  function showHttpsStatus() {

    if (!elHttpsStatus) {
      return;
    }

    let isHTTPS = false;


    try {

      const parsedURL =
        new URL(displayURL);

      isHTTPS =
        parsedURL.protocol.toLowerCase() ===
        "https:";

    } catch (error) {

      isHTTPS =
        scanResult.https === true ||
        scanResult.https === "true";

    }


    if (isHTTPS) {

      elHttpsStatus.textContent =
        "HTTPS — Secure Connection";

      elHttpsStatus.className =
        "https-status https-status--secure";

    } else {

      elHttpsStatus.textContent =
        "HTTP — Not Encrypted";

      elHttpsStatus.className =
        "https-status https-status--insecure";

    }

  }


  /* ============================================================
     13. DISPLAY SCAN TIME
     ============================================================ */

  function showScanTime() {

    if (!elScanTime) {
      return;
    }

    const date =
      new Date(scanResult.scannedAt);


    if (Number.isNaN(date.getTime())) {

      elScanTime.textContent =
        "Unknown";

      return;
    }


    elScanTime.textContent =
      date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }
      );

  }


  /* ============================================================
     14. GET STATUS
     ============================================================ */

  function getStatus() {

    return String(
      scanResult.status || "SAFE"
    ).toUpperCase();

  }


  /* ============================================================
     15. GET RISK SCORE
     ============================================================ */

  function getRiskScore() {

    const value =
      Number(scanResult.riskScore);


    if (!Number.isFinite(value)) {
      return 0;
    }


    return Math.max(
      0,
      Math.min(
        100,
        value
      )
    );

  }


  /* ============================================================
     16. DISPLAY MAIN RESULT
     ============================================================ */

  function showScanResult() {

    const status =
      getStatus();

    const riskScore =
      getRiskScore();


    /* ----------------------------------------------------------
       STATUS BADGE
       ---------------------------------------------------------- */

    if (elResultStatus) {

      elResultStatus.textContent =
        status;


      if (status === "SAFE") {

        elResultStatus.className =
          "result-status result-status--safe";

      }

      else if (
        status === "SUSPICIOUS"
      ) {

        elResultStatus.className =
          "result-status result-status--warning";

      }

      else {

        elResultStatus.className =
          "result-status result-status--danger";

      }

    }


    /* ----------------------------------------------------------
       HEADING + DESCRIPTION
       ---------------------------------------------------------- */

    if (
      elResultHeading &&
      elResultDescription
    ) {


      if (status === "SAFE") {

        elResultHeading.textContent =
          "This website appears to be safe.";

        elResultDescription.textContent =
          "Our scan did not detect any known scam patterns, suspicious redirects, or blacklisted content associated with this URL.";

      }


      else if (
        status === "SUSPICIOUS"
      ) {

        elResultHeading.textContent =
          "This website appears to be suspicious.";

        elResultDescription.textContent =
          "Our scan detected some suspicious characteristics associated with this URL. Proceed with caution before visiting.";

      }


      else {

        elResultHeading.textContent =
          "Warning! This website appears to be dangerous.";

        elResultDescription.textContent =
          "Our scan detected multiple risk indicators associated with this URL. Avoid visiting or entering personal information.";

      }

    }


    /* ----------------------------------------------------------
       RISK SCORE
       ---------------------------------------------------------- */

    if (elRiskScore) {

      elRiskScore.textContent =
        riskScore + "%";

    }


    /* ----------------------------------------------------------
       PROGRESS BAR
       ---------------------------------------------------------- */

    if (elRiskScoreFill) {

      elRiskScoreFill.style.width =
        riskScore + "%";


      if (status === "SAFE") {

        elRiskScoreFill.className =
          "risk-score-bar__fill risk-score-bar__fill--low";

      }

      else if (
        status === "SUSPICIOUS"
      ) {

        elRiskScoreFill.className =
          "risk-score-bar__fill risk-score-bar__fill--medium";

      }

      else {

        elRiskScoreFill.className =
          "risk-score-bar__fill risk-score-bar__fill--high";

      }

    }


    /* ----------------------------------------------------------
       RECOMMENDATION
       ---------------------------------------------------------- */

    if (elRecommendation) {

      if (status === "SAFE") {

        elRecommendation.textContent =
          "This website appears to be safe. You can continue browsing, but always avoid sharing sensitive information with unknown websites.";

      }

      else if (
        status === "SUSPICIOUS"
      ) {

        elRecommendation.textContent =
          "Be careful before visiting this website. Avoid entering passwords, payment information, or other sensitive details.";

      }

      else {

        elRecommendation.textContent =
          "Do not visit this website or enter personal information. The scan indicates that this URL may be dangerous.";

      }

    }

  }


  /* ============================================================
     17. DETECTION DETAILS
     ============================================================ */

  function updateDetectionDetails() {

    const cards =
      document.querySelectorAll(
        ".detection-card"
      );


    if (!cards.length) {
      return;
    }


    const status =
      getStatus();

    const isHTTPS =
      scanResult.https === true ||
      scanResult.https === "true";


    /* ----------------------------------------------------------
       CARD 1 — HTTPS CHECK
       ---------------------------------------------------------- */

    const httpsCard =
      cards[0];


    if (httpsCard) {

      const badge =
        httpsCard.querySelector(
          ".detection-card__badge"
        );


      if (badge) {

        if (isHTTPS) {

          badge.textContent =
            "Passed";

          badge.className =
            "detection-card__badge detection-card__badge--passed";

        } else {

          badge.textContent =
            "Warning";

          badge.className =
            "detection-card__badge detection-card__badge--warning";

        }

      }

    }


    /* ----------------------------------------------------------
       CARD 2 — DOMAIN REPUTATION
       ---------------------------------------------------------- */

    const domainCard =
      cards[1];


    if (domainCard) {

      const badge =
        domainCard.querySelector(
          ".detection-card__badge"
        );


      if (badge) {

        if (status === "SCAM") {

          badge.textContent =
            "Danger";

          badge.className =
            "detection-card__badge detection-card__badge--danger";

        }

        else if (
          status === "SUSPICIOUS"
        ) {

          badge.textContent =
            "Warning";

          badge.className =
            "detection-card__badge detection-card__badge--warning";

        }

        else {

          badge.textContent =
            "Passed";

          badge.className =
            "detection-card__badge detection-card__badge--passed";

        }

      }

    }


    /* ----------------------------------------------------------
       CARD 3 — URL STRUCTURE
       ---------------------------------------------------------- */

    const urlCard =
      cards[2];


    if (urlCard) {

      const badge =
        urlCard.querySelector(
          ".detection-card__badge"
        );


      if (badge) {

        /*
          Use backend reasons when available.
          If there are reasons, treat URL structure
          as a warning.
        */

        const reasons =
          Array.isArray(
            scanResult.reasons
          )
            ? scanResult.reasons
            : [];


        if (reasons.length > 0) {

          badge.textContent =
            "Warning";

          badge.className =
            "detection-card__badge detection-card__badge--warning";

        } else {

          badge.textContent =
            "Passed";

          badge.className =
            "detection-card__badge detection-card__badge--passed";

        }

      }

    }


    /* ----------------------------------------------------------
       CARD 4 — BLACKLIST CHECK
       ---------------------------------------------------------- */

    const blacklistCard =
      cards[3];


    if (blacklistCard) {

      const badge =
        blacklistCard.querySelector(
          ".detection-card__badge"
        );


      if (badge) {

        if (status === "SCAM") {

          badge.textContent =
            "Danger";

          badge.className =
            "detection-card__badge detection-card__badge--danger";

        }

        else if (
          status === "SUSPICIOUS"
        ) {

          badge.textContent =
            "Warning";

          badge.className =
            "detection-card__badge detection-card__badge--warning";

        }

        else {

          badge.textContent =
            "Passed";

          badge.className =
            "detection-card__badge detection-card__badge--passed";

        }

      }

    }

  }


  /* ============================================================
     18. SHOW REASONS IF HTML SUPPORTS IT
     ============================================================ */

  function showReasons() {

    const reasons =
      Array.isArray(
        scanResult.reasons
      )
        ? scanResult.reasons
        : [];


    if (!reasons.length) {
      return;
    }


    /*
      If your HTML contains an element with
      id="scanReasons", display backend reasons there.

      This does not break anything if the element
      does not exist.
    */

    const reasonsContainer =
      document.getElementById(
        "scanReasons"
      );


    if (!reasonsContainer) {
      return;
    }


    reasonsContainer.innerHTML = "";


    reasons.forEach(
      function (reason) {

        const li =
          document.createElement("li");

        li.textContent =
          reason;

        reasonsContainer.appendChild(
          li
        );

      }
    );

  }


  /* ============================================================
     19. ACTION BUTTONS
     ============================================================ */

  function setupButtons() {

    if (elAnalyzeAnotherBtn) {

      elAnalyzeAnotherBtn.addEventListener(
        "click",
        function () {

          /*
            Remove only the current result.
            Login information remains untouched.
          */

          localStorage.removeItem(
            "latestScanResult"
          );

          localStorage.removeItem(
            "lastScannedURL"
          );

          window.location.href =
            "index.html";

        }
      );

    }


    if (elGoHistoryBtn) {

      elGoHistoryBtn.addEventListener(
        "click",
        function () {

          window.location.href =
            "history.html";

        }
      );

    }

  }


  /* ============================================================
     20. MOBILE NAVIGATION
     ============================================================ */

  function setupMobileNav() {

    if (
      !hamburgerBtn ||
      !navMenu
    ) {
      return;
    }


    hamburgerBtn.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();


        const isOpen =
          navMenu.classList.toggle(
            "open"
          );


        hamburgerBtn.setAttribute(
          "aria-expanded",
          String(isOpen)
        );


        const icon =
          hamburgerBtn.querySelector(
            "i"
          );


        if (icon) {

          icon.className =
            isOpen
              ? "fa-solid fa-xmark"
              : "fa-solid fa-bars";

        }

      }
    );


    document.addEventListener(
      "click",
      function (event) {

        const clickedInsideNav =
          navMenu.contains(
            event.target
          );


        const clickedHamburger =
          hamburgerBtn.contains(
            event.target
          );


        if (
          !clickedInsideNav &&
          !clickedHamburger
        ) {

          navMenu.classList.remove(
            "open"
          );


          hamburgerBtn.setAttribute(
            "aria-expanded",
            "false"
          );


          const icon =
            hamburgerBtn.querySelector(
              "i"
            );


          if (icon) {

            icon.className =
              "fa-solid fa-bars";

          }

        }

      }
    );

  }


  /* ============================================================
     21. START RESULT PAGE
     ============================================================ */

  updateNavbar();

  showURL();

  showDomain();

  showHttpsStatus();

  showScanTime();

  showScanResult();

  updateDetectionDetails();

  showReasons();

  setupButtons();

  setupMobileNav();

});