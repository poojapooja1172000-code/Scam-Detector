"use strict";

/* ============================================================
   SCAM DETECTOR — frontend/js/reset-password.js

   Handles:
   - Checking OTP verification
   - New password
   - Confirm password
   - Sending reset request to backend
   - Redirecting to login after success
   ============================================================ */

const resetPasswordForm = document.getElementById("resetPasswordForm");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const resetPasswordMessage = document.getElementById("resetPasswordMessage");

const toggleNewPassword = document.getElementById("toggleNewPassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");


/* ============================================================
   CHECK RESET SESSION
   ============================================================ */

const resetEmail = sessionStorage.getItem("resetEmail");
const verifiedOtp = sessionStorage.getItem("verifiedOtp");
const otpVerified = sessionStorage.getItem("otpVerified");


if (!resetEmail || !verifiedOtp || otpVerified !== "true") {

  showMessage(
    "Your password reset session is invalid. Please request a new OTP.",
    "error"
  );

  resetPasswordBtn.disabled = true;
}


/* ============================================================
   SHOW MESSAGE
   ============================================================ */

function showMessage(message, type) {

  resetPasswordMessage.textContent = message;

  resetPasswordMessage.className =
    "reset-password-message " + type;
}


/* ============================================================
   SHOW / HIDE NEW PASSWORD
   ============================================================ */

toggleNewPassword.addEventListener("click", function () {

  const isPassword =
    newPasswordInput.type === "password";

  newPasswordInput.type =
    isPassword ? "text" : "password";

  toggleNewPassword.innerHTML = isPassword
    ? '<i class="fa-solid fa-eye-slash"></i>'
    : '<i class="fa-solid fa-eye"></i>';
});


/* ============================================================
   SHOW / HIDE CONFIRM PASSWORD
   ============================================================ */

toggleConfirmPassword.addEventListener("click", function () {

  const isPassword =
    confirmPasswordInput.type === "password";

  confirmPasswordInput.type =
    isPassword ? "text" : "password";

  toggleConfirmPassword.innerHTML = isPassword
    ? '<i class="fa-solid fa-eye-slash"></i>'
    : '<i class="fa-solid fa-eye"></i>';
});


/* ============================================================
   RESET PASSWORD
   ============================================================ */

resetPasswordForm.addEventListener("submit", async function (event) {

  event.preventDefault();


  const newPassword =
    newPasswordInput.value;

  const confirmPassword =
    confirmPasswordInput.value;


  /* ------------------------------------------------------------
     CHECK PASSWORD
     ------------------------------------------------------------ */

  if (!newPassword || !confirmPassword) {

    showMessage(
      "Please enter and confirm your new password.",
      "error"
    );

    return;
  }


  /* ------------------------------------------------------------
     PASSWORD LENGTH
     ------------------------------------------------------------ */

  if (newPassword.length < 6) {

    showMessage(
      "Password must be at least 6 characters long.",
      "error"
    );

    return;
  }


  /* ------------------------------------------------------------
     PASSWORD MATCH
     ------------------------------------------------------------ */

  if (newPassword !== confirmPassword) {

    showMessage(
      "Passwords do not match.",
      "error"
    );

    return;
  }


  /* ------------------------------------------------------------
     DISABLE BUTTON
     ------------------------------------------------------------ */

  resetPasswordBtn.disabled = true;

  resetPasswordBtn.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Updating Password...
  `;


  try {

    /* ==========================================================
       SEND REQUEST TO BACKEND
       ========================================================== */

    const response = await fetch(
      "https://scam-detector-omega.vercel.app/api/auth/reset-password",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: resetEmail,
          otp: verifiedOtp,
          newPassword: newPassword,
        }),
      }
    );


    const data = await response.json();


    /* ==========================================================
       HANDLE BACKEND ERROR
       ========================================================== */

    if (!response.ok) {

      throw new Error(
        data.message || "Unable to reset password."
      );
    }


    /* ==========================================================
       SUCCESS
       ========================================================== */

    showMessage(
      "Password updated successfully! Redirecting to login...",
      "success"
    );


    /*
      Clear the temporary password-reset information.
    */

    sessionStorage.removeItem("resetEmail");
    sessionStorage.removeItem("resetOtp");
    sessionStorage.removeItem("verifiedOtp");
    sessionStorage.removeItem("otpVerified");


    /*
      Redirect to login page.
    */

    setTimeout(function () {

      window.location.href = "login.html";

    }, 1500);


  } catch (error) {

    console.error(
      "Reset password error:",
      error
    );


    showMessage(
      error.message || "Unable to reset password.",
      "error"
    );


    /* Re-enable button */

    resetPasswordBtn.disabled = false;

    resetPasswordBtn.innerHTML = `
      <i class="fa-solid fa-key"></i>
      Reset Password
    `;
  }

});