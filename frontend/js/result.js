"use strict";

/* ============================================================
   SCAM DETECTOR — frontend/js/result.js

   Handles:
   1. Result page login protection
   2. Dynamic navbar and logout
   3. Reading the latest backend scan result
   4. Displaying URL, domain, HTTPS, status and risk score
   5. Changing status and progress-bar colours
   6. Result page action buttons
   7. Mobile navigation
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ============================================================
     1. PROTECT RESULT PAGE
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
     3. READ SAVED SCAN RESULT
     ============================================================ */

  const scannedURL =
    localStorage.getItem("lastScannedURL");

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
      error.message
    );
  }


  /* ============================================================
     4. CHECK THAT SCAN DATA EXISTS
     ============================================================ */

  if (!scannedURL || !scanResult) {
    alert(
      "No scan result found. Please scan a URL from the Home page first."
    );

    window.location.href = "index.html";
    return;
  }


  /* ============================================================
     5. DYNAMIC NAVBAR AND LOGOUT
     ============================================================ */

  function updateNavbarForLogin() {
    if (!navMenu) return;

    const loggedInUser =
      localStorage.getItem("loggedInUser") || "User";

    navMenu.innerHTML = `
      <li>
        <a href="index.html" class="nav-link">
          Home
        </a>
      </li>

      <li>
        <a href="history.html" class="nav-link">
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


  function logoutUser() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInEmail");
    localStorage.removeItem("loggedInUserId");

    alert("Logged out successfully.");

    window.location.href = "login.html";
  }


  function escapeHtml(text) {
    const div = document.createElement("div");

    div.textContent =
      text === undefined || text === null
        ? ""
        : String(text);

    return div.innerHTML;
  }


  /* ============================================================
     6. DISPLAY SCAN INFORMATION
     ============================================================ */

  function showURL() {
    if (!elScannedUrl) return;

    elScannedUrl.textContent =
      scanResult.url || scannedURL;
  }


  function showDomain() {
    if (!elScannedDomain) return;

    elScannedDomain.textContent =
      scanResult.domain || "Unknown";
  }


  function showHttpsStatus() {
    if (!elHttpsStatus) return;

    if (scanResult.https === true) {
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


  function showScanTime() {
    if (!elScanTime) return;

    const date = new Date(scanResult.scannedAt);

    if (Number.isNaN(date.getTime())) {
      elScanTime.textContent = "Unknown";
      return;
    }

    elScanTime.textContent =
      date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
  }


  function showScanResult() {
    const status =
      String(scanResult.status || "SAFE").toUpperCase();

    const riskScore =
      Number(scanResult.riskScore) || 0;


    /* Status */
    if (elResultStatus) {
      elResultStatus.textContent = status;

      if (status === "SAFE") {
        elResultStatus.className =
          "result-status result-status--safe";

      } else if (status === "SUSPICIOUS") {
        elResultStatus.className =
          "result-status result-status--warning";

      } else {
        elResultStatus.className =
          "result-status result-status--danger";
      }
    }


    /* Risk score */
    if (elRiskScore) {
      elRiskScore.textContent =
        riskScore + "%";
    }


    /* Progress bar */
    if (elRiskScoreFill) {
      elRiskScoreFill.style.width =
        riskScore + "%";

      if (status === "SAFE") {
        elRiskScoreFill.className =
          "risk-score-bar__fill risk-score-bar__fill--low";

      } else if (status === "SUSPICIOUS") {
        elRiskScoreFill.className =
          "risk-score-bar__fill risk-score-bar__fill--medium";

      } else {
        elRiskScoreFill.className =
          "risk-score-bar__fill risk-score-bar__fill--high";
      }
    }


    /* Recommendation */
    if (elRecommendation) {
      if (status === "SAFE") {
        elRecommendation.textContent =
          "This website appears to be safe.";

      } else if (status === "SUSPICIOUS") {
        elRecommendation.textContent =
          "Be careful before visiting this website.";

      } else {
        elRecommendation.textContent =
          "Warning! This website looks dangerous.";
      }
    }
  }


  /* ============================================================
     7. ACTION BUTTONS
     ============================================================ */

  function setupButtons() {
    if (elAnalyzeAnotherBtn) {
      elAnalyzeAnotherBtn.addEventListener(
        "click",
        function () {
          window.location.href = "index.html";
        }
      );
    }

    if (elGoHistoryBtn) {
      elGoHistoryBtn.addEventListener(
        "click",
        function () {
          window.location.href = "history.html";
        }
      );
    }
  }


  /* ============================================================
     8. MOBILE NAVIGATION
     ============================================================ */

  function setupMobileNav() {
    if (!hamburgerBtn || !navMenu) return;

    hamburgerBtn.addEventListener(
      "click",
      function (event) {
        event.stopPropagation();

        const isOpen =
          navMenu.classList.toggle("open");

        hamburgerBtn.setAttribute(
          "aria-expanded",
          String(isOpen)
        );

        const icon =
          hamburgerBtn.querySelector("i");

        if (icon) {
          icon.className = isOpen
            ? "fa-solid fa-xmark"
            : "fa-solid fa-bars";
        }
      }
    );

    document.addEventListener(
      "click",
      function (event) {
        const clickedInsideNav =
          navMenu.contains(event.target);

        const clickedHamburger =
          hamburgerBtn.contains(event.target);

        if (
          !clickedInsideNav &&
          !clickedHamburger
        ) {
          navMenu.classList.remove("open");

          hamburgerBtn.setAttribute(
            "aria-expanded",
            "false"
          );

          const icon =
            hamburgerBtn.querySelector("i");

          if (icon) {
            icon.className =
              "fa-solid fa-bars";
          }
        }
      }
    );
  }


  /* ============================================================
     9. START RESULT PAGE
     ============================================================ */

  updateNavbarForLogin();
  showURL();
  showDomain();
  showHttpsStatus();
  showScanTime();
  showScanResult();
  setupButtons();
  setupMobileNav();

});