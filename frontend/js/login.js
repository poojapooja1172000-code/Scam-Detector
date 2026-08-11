"use strict";

/* ============================================================
   SCAM DETECTOR — frontend/js/login.js

   What this file does:
   - Shows and hides the password
   - Validates email and password
   - Sends login details to the backend API
   - Handles Remember Me
   - Saves basic login state
   - Redirects to index.html after successful login
   - Redirects to register.html for account creation
   - Handles the mobile navigation menu
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ============================================================
     1. GET HTML ELEMENTS
     ============================================================ */

  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const togglePassword = document.getElementById("togglePassword");
  const rememberMe = document.getElementById("rememberMe");
  const loginBtn = document.getElementById("loginBtn");
  const createAccountBtn = document.getElementById("createAccountBtn");

  /* Mobile navigation */
  const hamburgerBtn = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-links");

  /* Store the original login button content */
  const originalLoginButtonHTML = loginBtn
    ? loginBtn.innerHTML
    : "Login";


  /* ============================================================
     2. SHOW OR HIDE PASSWORD
     ============================================================ */

  function togglePasswordVisibility() {
    if (!passwordInput || !togglePassword) return;

    const icon = togglePassword.querySelector("i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.setAttribute("aria-label", "Hide password");

      if (icon) {
        icon.className = "fa-solid fa-eye-slash";
      }
    } else {
      passwordInput.type = "password";
      togglePassword.setAttribute("aria-label", "Show password");

      if (icon) {
        icon.className = "fa-solid fa-eye";
      }
    }
  }

  if (togglePassword) {
    togglePassword.addEventListener(
      "click",
      togglePasswordVisibility
    );
  }


  /* ============================================================
     3. VALIDATION FUNCTIONS
     ============================================================ */

  function isValidEmail(email) {
    const trimmedEmail = email.trim();

    if (trimmedEmail === "") {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(trimmedEmail);
  }

  function isValidPassword(password) {
    return password.length >= 6;
  }


  /* ============================================================
     4. LOAD REMEMBERED EMAIL
     ============================================================ */

  function loadRememberedEmail() {
    if (!emailInput) return;

    try {
      const savedEmail =
        localStorage.getItem("rememberedEmail");

      if (savedEmail) {
        emailInput.value = savedEmail;

        if (rememberMe) {
          rememberMe.checked = true;
        }
      }
    } catch (error) {
      console.error(
        "Could not load remembered email:",
        error.message
      );
    }
  }

  loadRememberedEmail();


  /* ============================================================
     5. SAVE OR REMOVE REMEMBERED EMAIL
     ============================================================ */

  function handleRememberMe(email) {
    try {
      if (rememberMe && rememberMe.checked) {
        localStorage.setItem(
          "rememberedEmail",
          email.trim()
        );
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    } catch (error) {
      console.error(
        "Could not update remembered email:",
        error.message
      );
    }
  }


  /* ============================================================
     6. SAVE BASIC LOGIN STATE
     ============================================================ */

  function saveLoginState(user) {
    try {
      localStorage.setItem("isLoggedIn", "true");

      localStorage.setItem(
        "loggedInUser",
        user.name || "User"
      );

      localStorage.setItem(
        "loggedInEmail",
        user.email || ""
      );

      localStorage.setItem(
        "loggedInUserId",
        user.id || ""
      );
    } catch (error) {
      console.error(
        "Could not save login state:",
        error.message
      );
    }
  }


  /* ============================================================
     7. LOGIN FORM SUBMISSION
     ============================================================ */

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      async function (event) {

        /* Stop normal page reload */
        event.preventDefault();

        const email = emailInput
          ? emailInput.value.trim()
          : "";

        const password = passwordInput
          ? passwordInput.value
          : "";

        /* Validate email */
        if (!isValidEmail(email)) {
          alert(
            "Please enter a valid email address."
          );

          if (emailInput) {
            emailInput.focus();
          }

          return;
        }

        /* Validate password */
        if (!isValidPassword(password)) {
          alert(
            "Password must be at least 6 characters long."
          );

          if (passwordInput) {
            passwordInput.focus();
          }

          return;
        }

        try {
          /* Disable the login button */
          if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = "Logging in...";
          }

          /* Send login data to the backend */
          const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                email,
                password,
              }),
            }
          );

          const data = await response.json();

          /* Handle login error */
          if (!response.ok) {
            alert(
              data.message ||
              "Invalid email or password."
            );

            if (passwordInput) {
              passwordInput.focus();
            }

            return;
          }

          /* Save Remember Me setting */
          handleRememberMe(email);

          /* Save basic login information */
          saveLoginState(data.user);

          /* Show success message */
          alert(
            "Login successful! Welcome, " +
            data.user.name +
            "."
          );

          /* Redirect to Home page */
          window.location.href = "index.html";

        } catch (error) {
          console.error("Login error:", error);

          alert(
            "Could not connect to the server. " +
            "Please make sure the backend is running."
          );

        } finally {
          /* Restore the login button */
          if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML =
              originalLoginButtonHTML;
          }
        }
      }
    );
  }


  /* ============================================================
     8. CREATE ACCOUNT BUTTON
     ============================================================ */

  if (createAccountBtn) {
    createAccountBtn.addEventListener(
      "click",
      function () {
        window.location.href = "register.html";
      }
    );
  }


  /* ============================================================
     9. MOBILE NAVIGATION
     ============================================================ */

  function toggleMobileMenu() {
    if (!navMenu || !hamburgerBtn) return;

    const isOpen =
      navMenu.classList.toggle("open");

    hamburgerBtn.setAttribute(
      "aria-expanded",
      isOpen
    );

    const icon = hamburgerBtn.querySelector("i");

    if (icon) {
      icon.className = isOpen
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars";
    }
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener(
      "click",
      toggleMobileMenu
    );
  }

  /* Close menu when clicking outside */
  document.addEventListener(
    "click",
    function (event) {
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

        const icon =
          hamburgerBtn.querySelector("i");

        if (icon) {
          icon.className =
            "fa-solid fa-bars";
        }
      }
    }
  );

});