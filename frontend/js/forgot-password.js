"use strict";


const forgotPasswordForm =
  document.getElementById("forgotPasswordForm");

const forgotEmail =
  document.getElementById("forgotEmail");

const sendOtpBtn =
  document.getElementById("sendOtpBtn");

const forgotPasswordMessage =
  document.getElementById("forgotPasswordMessage");


console.log("Forgot Password JS loaded successfully");


/* ============================================================
   SHOW MESSAGE
   ============================================================ */

function showMessage(message, type) {

  if (!forgotPasswordMessage) {
    console.error(
      "forgotPasswordMessage element not found!"
    );

    return;
  }

  forgotPasswordMessage.textContent = message;

  forgotPasswordMessage.className =
    "forgot-password-message " + type;
}


/* ============================================================
   SEND OTP
   ============================================================ */

if (forgotPasswordForm) {

  forgotPasswordForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      console.log("Send OTP button clicked");


      const email =
        forgotEmail.value.trim().toLowerCase();


      console.log(
        "Email entered:",
        email
      );


      /* ------------------------------------------------------
         CHECK EMAIL
         ------------------------------------------------------ */

      if (!email) {

        showMessage(
          "Please enter your email address.",
          "error"
        );

        return;
      }


      /* ------------------------------------------------------
         DISABLE BUTTON
         ------------------------------------------------------ */

      sendOtpBtn.disabled = true;

      sendOtpBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Sending OTP...
      `;


      try {

        console.log(
          "Sending request to backend..."
        );


        /* ====================================================
           CALL BACKEND
           ==================================================== */

        const response = await fetch(
          "http://localhost:5000/api/auth/forgot-password",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              email: email
            })
          }
        );


        console.log(
          "Backend response status:",
          response.status
        );


        const data =
          await response.json();


        console.log(
          "Backend response:",
          data
        );


        /* ----------------------------------------------------
           BACKEND ERROR
           ---------------------------------------------------- */

        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to send OTP."
          );
        }


        /* ====================================================
           SAVE ONLY EMAIL
           ==================================================== */

        sessionStorage.setItem(
          "resetEmail",
          email
        );


        /* ====================================================
           SUCCESS
           ==================================================== */

        showMessage(
          "OTP sent successfully. Check your email.",
          "success"
        );


        /* ====================================================
           GO TO VERIFY OTP PAGE
           ==================================================== */

        setTimeout(function () {

          window.location.href =
            "verify-otp.html";

        }, 1000);


      } catch (error) {

        console.error(
          "Forgot password error:",
          error
        );


        showMessage(
          error.message ||
          "Unable to send OTP.",
          "error"
        );


        /* ----------------------------------------------------
           ENABLE BUTTON AGAIN
           ---------------------------------------------------- */

        sendOtpBtn.disabled = false;

        sendOtpBtn.innerHTML = `
          <i class="fa-solid fa-paper-plane"></i>
          Send OTP
        `;
      }

    }
  );

} else {

  console.error(
    "forgotPasswordForm not found!"
  );
}