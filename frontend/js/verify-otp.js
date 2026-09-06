"use strict";

/* ============================================================
   SCAM DETECTOR — frontend/js/verify-otp.js

   Handles:
   - Reading reset email
   - Reading OTP entered by user
   - Sending OTP to backend
   - Verifying OTP
   - Moving to reset-password.html
   ============================================================ */


const verifyOtpForm =
  document.getElementById("verifyOtpForm");

const otpInput =
  document.getElementById("otpInput");

const verifyOtpBtn =
  document.getElementById("verifyOtpBtn");

const verifyOtpMessage =
  document.getElementById("verifyOtpMessage");


/* ============================================================
   GET RESET EMAIL
   ============================================================ */

const resetEmail =
  sessionStorage.getItem("resetEmail");


console.log(
  "Reset email:",
  resetEmail
);


/* ============================================================
   CHECK RESET SESSION
   ============================================================ */

if (!resetEmail) {

  showMessage(
    "Your reset session has expired. Please request a new OTP.",
    "error"
  );

  verifyOtpBtn.disabled = true;
}


/* ============================================================
   SHOW MESSAGE
   ============================================================ */

function showMessage(message, type) {

  if (!verifyOtpMessage) {
    return;
  }

  verifyOtpMessage.textContent =
    message;

  verifyOtpMessage.className =
    "verify-otp-message " + type;
}


/* ============================================================
   ALLOW ONLY NUMBERS
   ============================================================ */

if (otpInput) {

  otpInput.addEventListener(
    "input",
    function () {

      otpInput.value =
        otpInput.value
          .replace(/\D/g, "")
          .slice(0, 6);

    }
  );
}


/* ============================================================
   VERIFY OTP
   ============================================================ */

if (verifyOtpForm) {

  verifyOtpForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      /* --------------------------------------------------------
         CHECK EMAIL SESSION
         -------------------------------------------------------- */

      if (!resetEmail) {

        showMessage(
          "Please request a new OTP.",
          "error"
        );

        return;
      }


      /* --------------------------------------------------------
         GET OTP ENTERED BY USER
         -------------------------------------------------------- */

      const otp =
        otpInput.value.trim();


      if (!otp) {

        showMessage(
          "Please enter the OTP.",
          "error"
        );

        return;
      }


      if (otp.length !== 6) {

        showMessage(
          "OTP must contain 6 digits.",
          "error"
        );

        return;
      }


      /* --------------------------------------------------------
         DISABLE BUTTON
         -------------------------------------------------------- */

      verifyOtpBtn.disabled = true;

      verifyOtpBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Verifying...
      `;


      try {

        console.log(
          "Verifying OTP:",
          otp
        );


        /* ======================================================
           SEND OTP TO BACKEND
           ====================================================== */

        const response = await fetch(
          "https://scam-detector-omega.vercel.app/api/auth/verify-otp",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              email: resetEmail,
              otp: otp
            })
          }
        );


        const data =
          await response.json();


        console.log(
          "Verify OTP response:",
          data
        );


        /* ======================================================
           BACKEND ERROR
           ====================================================== */

        if (!response.ok) {

          throw new Error(
            data.message ||
            "Invalid OTP."
          );
        }


        /* ======================================================
           OTP VERIFIED
           ====================================================== */

        if (data.verified === true) {

          /* ----------------------------------------------------
             Save verification status
             ---------------------------------------------------- */

          sessionStorage.setItem(
            "otpVerified",
            "true"
          );


          sessionStorage.setItem(
            "verifiedOtp",
            otp
          );


          /* ----------------------------------------------------
             SHOW SUCCESS
             ---------------------------------------------------- */

          showMessage(
            "OTP verified successfully!",
            "success"
          );


          /* ----------------------------------------------------
             MOVE TO RESET PASSWORD
             ---------------------------------------------------- */

          setTimeout(function () {

            window.location.href =
              "reset-password.html";

          }, 1000);


        } else {

          throw new Error(
            "OTP verification failed."
          );
        }


      } catch (error) {

        console.error(
          "Verify OTP error:",
          error
        );


        showMessage(
          error.message ||
          "Unable to verify OTP.",
          "error"
        );


        verifyOtpBtn.disabled = false;

        verifyOtpBtn.innerHTML = `
          <i class="fa-solid fa-circle-check"></i>
          Verify OTP
        `;
      }

    }
  );
}