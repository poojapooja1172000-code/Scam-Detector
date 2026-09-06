"use strict";

/* ============================================================
   SCAM DETECTOR — frontend/js/app.js

   Handles:
   1. Dynamic navbar after login
   2. Logout
   3. Mobile navigation
   4. URL validation
   5. Sending URL to backend`
   6. Saving scan result
   7. Redirecting to result.html
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ============================================================
     1. GET HTML ELEMENTS
     ============================================================ */

  const hamburgerBtn = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-links");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const urlInput = document.getElementById("urlInput");


  /* ============================================================
     2. DYNAMIC NAVBAR AND LOGOUT
     ============================================================ */

  function updateNavbarForLogin() {
    if (!navMenu) return;

    const isLoggedIn =
      localStorage.getItem("isLoggedIn") === "true";

    const loggedInUser =
      localStorage.getItem("loggedInUser") || "User";

    if (isLoggedIn) {
      navMenu.innerHTML = `
        <li>
          <a href="index.html" class="nav-link active">
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

      const logoutBtn = document.getElementById("logoutBtn");

      if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
      }
    }
  }


  function logoutUser() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInEmail");
    localStorage.removeItem("loggedInUserId");

    /* Keep rememberedEmail because it belongs to Remember Me */

    alert("Logged out successfully.");

    window.location.href = "login.html";
  }


  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }


  /* Update navbar immediately after the page loads */
  updateNavbarForLogin();


  /* ============================================================
     3. MOBILE NAVIGATION
     ============================================================ */

  function toggleMobileMenu() {
    if (!navMenu || !hamburgerBtn) return;

    const isOpen = navMenu.classList.toggle("open");

    hamburgerBtn.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    const icon = hamburgerBtn.querySelector("i");

    if (icon) {
      icon.className = isOpen
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars";
    }
  }


  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener(
      "click",
      toggleMobileMenu
    );
  }


  document.addEventListener("click", function (event) {
    if (!navMenu || !hamburgerBtn) return;

    const clickedInsideNav =
      navMenu.contains(event.target);

    const clickedHamburger =
      hamburgerBtn.contains(event.target);

    if (!clickedInsideNav && !clickedHamburger) {
      navMenu.classList.remove("open");

      hamburgerBtn.setAttribute(
        "aria-expanded",
        "false"
      );

      const icon = hamburgerBtn.querySelector("i");

      if (icon) {
        icon.className = "fa-solid fa-bars";
      }
    }
  });


  /* ============================================================
     4. URL VALIDATION
     ============================================================ */

  function validateURL(url) {
    try {
      const parsedURL = new URL(url);

      return (
        parsedURL.protocol === "http:" ||
        parsedURL.protocol === "https:"
      );

    } catch (error) {
      return false;
    }
  }


  /* ============================================================
     5. INPUT ERROR HANDLING
     ============================================================ */

  function showInputError(message) {
    let errorElement =
      document.querySelector(".input-error");

    if (!errorElement) {
      errorElement = document.createElement("p");
      errorElement.className = "input-error";

      const inputGroup =
        document.querySelector(".hero-input-group");

      if (inputGroup) {
        inputGroup.insertAdjacentElement(
          "afterend",
          errorElement
        );
      }
    }

    errorElement.textContent = message;

    if (urlInput) {
      urlInput.style.borderColor = "#DC2626";
    }
  }


  function clearInputError() {
    const errorElement =
      document.querySelector(".input-error");

    if (errorElement) {
      errorElement.textContent = "";
    }

    if (urlInput) {
      urlInput.style.borderColor = "";
    }
  }


  /* ============================================================
     6. ANALYZE URL
     ============================================================ */

  async function analyzeURL() {
    clearInputError();

    const rawInput = urlInput
      ? urlInput.value.trim()
      : "";

    /* Empty input */
    if (rawInput === "") {
      showInputError(
        "⚠ Please enter a website URL."
      );

      if (urlInput) {
        urlInput.focus();
      }

      return;
    }

    /* Invalid URL */
    if (!validateURL(rawInput)) {
      showInputError(
        "⚠ Please enter a valid URL (e.g. https://example.com)."
      );

      if (urlInput) {
        urlInput.focus();
      }

      return;
    }

    try {
      /* Disable button while scanning */
      if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = "Analyzing...";
      }

      /* Send URL to backend */
      const response = await fetch(
      "https://scam-detector-omega.vercel.app/api/scan/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
  url: rawInput,
  userId: localStorage.getItem("loggedInUserId"),
}),
        }
      );

      const data = await response.json();

      /* Backend error */
      if (!response.ok) {
        alert(
          data.message || "URL analysis failed."
        );

        return;
      }

      /* Save URL */
      saveURL(rawInput);

      /* Save complete backend result */
      localStorage.setItem(
        "latestScanResult",
        JSON.stringify(data.result)
      );

      /* Open result page */
      redirectToResult();

    } catch (error) {
      console.error("Scan error:", error);

      alert(
        "Could not connect to the Scam Detector server."
      );

    } finally {
      /* Restore Analyze button */
      if (analyzeBtn) {
        analyzeBtn.disabled = false;

        analyzeBtn.innerHTML =
          '<i class="fa-solid fa-magnifying-glass"></i> Analyze URL';
      }
    }
  }


  /* ============================================================
     7. SAVE URL
     ============================================================ */

  function saveURL(url) {
    try {
      localStorage.setItem(
        "lastScannedURL",
        url
      );
    } catch (error) {
      console.error(
        "Could not save URL:",
        error.message
      );
    }
  }


  /* ============================================================
     8. REDIRECT TO RESULT PAGE
     ============================================================ */

  function redirectToResult() {
    window.location.href = "result.html";
  }


  /* ============================================================
     9. EVENT LISTENERS
     ============================================================ */

  if (analyzeBtn) {
    analyzeBtn.addEventListener(
      "click",
      analyzeURL
    );
  }


  if (urlInput) {
    /* Analyze when Enter is pressed */
    urlInput.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Enter") {
          analyzeURL();
        }
      }
    );

    /* Clear errors when typing */
    urlInput.addEventListener(
      "input",
      clearInputError
    );
  }

});