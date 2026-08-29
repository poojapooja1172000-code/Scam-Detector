"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* =========================
       USER INFORMATION
       ========================= */

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },


    /* =========================
       PASSWORD RESET OTP
       ========================= */

    resetPasswordOTP: {
      type: String,
      default: null,
    },

    resetPasswordOTPExpires: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
