"use strict";

/* ============================================================
   SCAM DETECTOR — frontend/js/login.js

   Handles:
   1. Show / hide password
   2. Email and password validation
   3. Login API request
   4. Remember Me
   5. Save login state
   6. Redirect after successful login
   7. Create account button
   8. Mobile navigation
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

    /* Store original login button */
    const originalLoginButtonHTML = loginBtn
        ? loginBtn.innerHTML
        : "Login";


    /* ============================================================
       2. SHOW / HIDE PASSWORD
       ============================================================ */

    function togglePasswordVisibility() {

        if (!passwordInput || !togglePassword) {
            return;
        }

        const icon = togglePassword.querySelector("i");

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

            if (icon) {
                icon.className = "fa-solid fa-eye-slash";
            }

        } else {

            passwordInput.type = "password";

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

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

        if (!emailInput) {
            return;
        }

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
       5. SAVE / REMOVE REMEMBERED EMAIL
       ============================================================ */

    function handleRememberMe(email) {

        try {

            if (rememberMe && rememberMe.checked) {

                localStorage.setItem(
                    "rememberedEmail",
                    email.trim()
                );

            } else {

                localStorage.removeItem(
                    "rememberedEmail"
                );
            }

        } catch (error) {

            console.error(
                "Could not update remembered email:",
                error.message
            );
        }
    }


    /* ============================================================
       6. SAVE LOGIN STATE
       ============================================================ */

    function saveLoginState(user) {

        try {

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );

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

                /* Prevent normal form submission */
                event.preventDefault();

                const email = emailInput
                    ? emailInput.value.trim()
                    : "";

                const password = passwordInput
                    ? passwordInput.value
                    : "";


                /* ------------------------------------------------
                   Validate email
                   ------------------------------------------------ */

                if (!isValidEmail(email)) {

                    alert(
                        "Please enter a valid email address."
                    );

                    if (emailInput) {
                        emailInput.focus();
                    }

                    return;
                }


                /* ------------------------------------------------
                   Validate password
                   ------------------------------------------------ */

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

                    /* Disable login button */
                    if (loginBtn) {

                        loginBtn.disabled = true;

                        loginBtn.textContent =
                            "Logging in...";
                    }


                    /* ------------------------------------------------
                       SEND LOGIN DATA TO VERCEL BACKEND
                       ------------------------------------------------ */

                    const response = await fetch(
                        "https://scam-detector-omega.vercel.app/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                    /* Get backend response */
                    const data = await response.json();


                    /* ------------------------------------------------
                       HANDLE LOGIN ERROR
                       ------------------------------------------------ */

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


                    /* ------------------------------------------------
                       LOGIN SUCCESS
                       ------------------------------------------------ */

                    handleRememberMe(email);

                    saveLoginState(data.user);


                    alert(
                        "Login successful! Welcome, " +
                        data.user.name +
                        "."
                    );


                    /* Redirect to home */
                    window.location.href = "index.html";


                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );

                    alert(
                        "Could not connect to the server. " +
                        "Please try again."
                    );


                } finally {

                    /* Restore login button */

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

                window.location.href =
                    "register.html";
            }
        );
    }


    /* ============================================================
       9. MOBILE NAVIGATION
       ============================================================ */

    function toggleMobileMenu() {

        if (!navMenu || !hamburgerBtn) {
            return;
        }

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


    if (hamburgerBtn && navMenu) {

        hamburgerBtn.addEventListener(
            "click",
            toggleMobileMenu
        );
    }


    /* Close mobile menu when clicking outside */

    document.addEventListener(
        "click",
        function (event) {

            if (!navMenu || !hamburgerBtn) {
                return;
            }

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

});