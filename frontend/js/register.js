"use strict";

/* ============================================================
   SCAM DETECTOR — register.js

   What this file does:
   - Show / hide passwords
   - Validate all form fields before submitting
   - Save user data to localStorage on success
   - Redirect to login.html after registration
   - Handle mobile navigation hamburger menu
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {


  /* ----------------------------------------------------------
     STEP 1 — GRAB ALL ELEMENTS FROM THE HTML
     Using only the IDs that exist in register.html
  ---------------------------------------------------------- */

  const registerForm          = document.getElementById("registerForm");
  const fullNameInput         = document.getElementById("fullNameInput");
  const emailInput            = document.getElementById("emailInput");
  const passwordInput         = document.getElementById("passwordInput");
  const confirmPasswordInput  = document.getElementById("confirmPasswordInput");
  const togglePassword        = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
  const termsCheckbox         = document.getElementById("termsCheckbox");
  const registerBtn           = document.getElementById("registerBtn");
  const loginRedirectBtn      = document.getElementById("loginRedirectBtn");

  /* Mobile nav */
  const hamburgerBtn = document.querySelector(".nav-toggle");
  const navMenu      = document.querySelector(".nav-links");


  /* ============================================================
     PASSWORD TOGGLE FUNCTIONS
     ============================================================ */

  /* ----------------------------------------------------------
     togglePasswordVisibility(inputEl, btnEl)

     What it does:
     - Switches the input between type="password" (hidden dots)
       and type="text" (visible characters)
     - Swaps the eye icon accordingly:
         fa-eye      = currently hidden → click to show
         fa-eye-slash = currently visible → click to hide

     Why we need it:
     - Users often mistype passwords when they cannot see them.
       This gives them the option to check what they typed.
  ---------------------------------------------------------- */
  function togglePasswordVisibility(inputEl, btnEl) {
    if (!inputEl || !btnEl) return;

    const icon = btnEl.querySelector("i");

    if (inputEl.type === "password") {
      /* Currently hidden → make it visible */
      inputEl.type    = "text";
      btnEl.setAttribute("aria-label", "Hide password");
      if (icon) icon.className = "fa-solid fa-eye-slash";
    } else {
      /* Currently visible → hide it again */
      inputEl.type    = "password";
      btnEl.setAttribute("aria-label", "Show password");
      if (icon) icon.className = "fa-solid fa-eye";
    }
  }

  /* Attach toggle to the Password field */
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      togglePasswordVisibility(passwordInput, togglePassword);
    });
  }

  /* Attach toggle to the Confirm Password field */
  if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener("click", function () {
      togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
    });
  }


  /* ============================================================
     VALIDATION FUNCTIONS
     — Each function checks one field and returns true/false.
     — Keeping them separate makes the code easy to read and
       easy to update later when the backend is connected.
     ============================================================ */

  /* ----------------------------------------------------------
     isValidFullName(name)

     What it does:
     - Trims spaces from both ends of the name
     - Returns false if the result is empty
     - Returns false if the name is shorter than 2 characters
     - Returns true if the name looks reasonable

     Why we need it:
     - We don't want blank names or single-letter entries
       being saved as real accounts.
  ---------------------------------------------------------- */
  function isValidFullName(name) {
    const trimmed = name.trim();
    if (trimmed === "") return false;
    if (trimmed.length < 2) return false;
    return true;
  }


  /* ----------------------------------------------------------
     isValidEmail(email)

     What it does:
     - Uses a Regular Expression (regex) to check the email
       format: must have characters, @, domain, and extension.
     - Example valid  : you@example.com
     - Example invalid: hello, @gmail, user@

     Why we need it:
     - Without format checking, anyone could type "abc" in
       the email box and the form would still submit.
  ---------------------------------------------------------- */
  function isValidEmail(email) {
    const trimmed = email.trim();
    if (trimmed === "") return false;

    /* This regex checks the basic email pattern */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  }


  /* ----------------------------------------------------------
     isValidPassword(password)

     What it does:
     - Returns false if the password is shorter than 6 characters
     - Returns true if it meets the minimum length

     Why we need it:
     - Very short passwords are too easy to guess.
     - 6 characters is the minimum we enforce on the frontend.
       The backend should enforce stronger rules later.
  ---------------------------------------------------------- */
  function isValidPassword(password) {
    return password.length >= 6;
  }


  /* ----------------------------------------------------------
     doPasswordsMatch(password, confirmPassword)

     What it does:
     - Compares the two password fields character by character
     - Returns true only if they are exactly the same

     Why we need it:
     - Users often make a typo when creating a new password.
       Asking them to type it twice catches those mistakes.
  ---------------------------------------------------------- */
  function doPasswordsMatch(password, confirmPassword) {
    return password === confirmPassword;
  }


  /* ----------------------------------------------------------
     isTermsChecked()

     What it does:
     - Returns true if the checkbox is ticked, false if not.

     Why we need it:
     - We must confirm the user agreed to Terms & Conditions
       before creating an account.
  ---------------------------------------------------------- */
  function isTermsChecked() {
    if (!termsCheckbox) return false;
    return termsCheckbox.checked;
  }


  /* ============================================================
     MAIN VALIDATION — runAllValidations()

     What it does:
     - Calls every individual validation function above
     - Stops at the first failure and shows a friendly message
     - Returns true only if EVERY check passes

     Why we need it:
     - One central place that runs all checks in order makes
       the form submit handler clean and easy to read.
  ============================================================ */
  function runAllValidations() {

    const fullName        = fullNameInput        ? fullNameInput.value        : "";
    const email           = emailInput           ? emailInput.value           : "";
    const password        = passwordInput        ? passwordInput.value        : "";
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

    /* Check 1 — Full Name */
    if (!isValidFullName(fullName)) {
      alert("Please enter your full name (at least 2 characters).");
      if (fullNameInput) fullNameInput.focus();
      return false;
    }

    /* Check 2 — Email */
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address (e.g. you@example.com).");
      if (emailInput) emailInput.focus();
      return false;
    }

    /* Check 3 — Password length */
    if (!isValidPassword(password)) {
      alert("Password must be at least 6 characters long.");
      if (passwordInput) passwordInput.focus();
      return false;
    }

    /* Check 4 — Passwords match */
    if (!doPasswordsMatch(password, confirmPassword)) {
      alert("Passwords do not match. Please re-enter your confirm password.");
      if (confirmPasswordInput) confirmPasswordInput.focus();
      return false;
    }

    /* Check 5 — Terms & Conditions */
    if (!isTermsChecked()) {
      alert("Please agree to the Terms & Conditions to create an account.");
      if (termsCheckbox) termsCheckbox.focus();
      return false;
    }

    /* All checks passed */
    return true;
  }


  /* ============================================================
     SAVE USER TO LOCALSTORAGE — saveUserToStorage()

     What it does:
     - Saves name, email, and password under fixed keys.
     - result.js and login.js can read these keys later.

     NOTE FOR FUTURE:
     - Never store real passwords in localStorage in a real app.
     - This is demo-only storage for a college project.
       A real backend would store a hashed password in a database.
  ============================================================ */
  function saveUserToStorage(name, email, password) {
    try {
      localStorage.setItem("registeredName",     name.trim());
      localStorage.setItem("registeredEmail",    email.trim());
      localStorage.setItem("registeredPassword", password);
    } catch (err) {
      console.error("Could not save to localStorage:", err.message);
    }
  }


  /* ============================================================
     FORM SUBMIT HANDLER

     What it does:
     - Prevents the browser's default form submission (page reload)
     - Runs all validations
     - If validation fails → stops here (alert was already shown)
     - If validation passes → saves data, shows success, redirects
  ============================================================ */
  if (registerForm) {
  registerForm.addEventListener("submit", async function (event) {

    /* Stop the browser from reloading the page */
    event.preventDefault();

    /* Run all validation checks */
    const isValid = runAllValidations();
    if (!isValid) return;

    /* Collect final values */
    const name = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
      /* Disable button while request is processing */
      if (registerBtn) {
        registerBtn.disabled = true;
        registerBtn.textContent = "Creating Account...";
      }

      /* Send registration details to the backend */
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      /* Handle backend error */
      if (!response.ok) {
        alert(data.message || "Account creation failed.");
        return;
      }

      /* Registration successful */
      alert("Account created successfully! Please log in.");

      window.location.href = "login.html";

    } catch (error) {
      console.error("Registration error:", error);

      alert(
        "Could not connect to the server. Please make sure the backend is running."
      );

    } finally {
      /* Re-enable button */
      if (registerBtn) {
        registerBtn.disabled = false;
        registerBtn.innerHTML =
          '<i class="fa-solid fa-user-plus" aria-hidden="true"></i> Create Account';
      }
    }
  });
}
  /* ============================================================
     LOGIN REDIRECT BUTTON
     ============================================================ */

  if (loginRedirectBtn) {
    loginRedirectBtn.addEventListener("click", function () {
      window.location.href = "login.html";
    });
  }


  /* ============================================================
     MOBILE NAVIGATION TOGGLE
     ============================================================ */

  function toggleMobileMenu() {
    if (!navMenu || !hamburgerBtn) return;

    const isOpen = navMenu.classList.toggle("open");
    hamburgerBtn.setAttribute("aria-expanded", isOpen);

    const icon = hamburgerBtn.querySelector("i");

    if (icon) {
      icon.className = isOpen
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars";
    }
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", toggleMobileMenu);
  }

  document.addEventListener("click", function (event) {
    if (!navMenu || !hamburgerBtn) return;

    const clickedInsideNav = navMenu.contains(event.target);
    const clickedHamburger = hamburgerBtn.contains(event.target);

    if (!clickedInsideNav && !clickedHamburger) {
      navMenu.classList.remove("open");
      hamburgerBtn.setAttribute("aria-expanded", "false");

      const icon = hamburgerBtn.querySelector("i");

      if (icon) {
        icon.className = "fa-solid fa-bars";
      }
    }
  });

});