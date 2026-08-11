"use strict";

/* ============================================================
   SCAM DETECTOR — backend/models/User.js

   What this file does:
   - Defines the shape of a User document in MongoDB
   - Enforces rules on every field (required, unique, etc.)
   - Automatically adds createdAt and updatedAt timestamps
   - Exports a User model other files can use to read/write users

   How it is used:
   - Import User in your route/controller files like this:
       const User = require("../models/User");
   - Then create, find, or delete users:
       const user = await User.create({ name, email, password });
   ============================================================ */


/* ============================================================
   SECTION 1 — IMPORT MONGOOSE
   — Mongoose lets us define a Schema (shape of our data)
     and a Model (the tool we use to interact with MongoDB).
   ============================================================ */

const mongoose = require("mongoose");


/* ============================================================
   SECTION 2 — CREATE THE SCHEMA
   — A Schema is like a form template.
   — It tells MongoDB exactly what fields a User document
     must have, what type each field is, and any rules
     (required, unique, lowercase, etc.) that apply.
   ============================================================ */

const userSchema = new mongoose.Schema(

  /* --- Field Definitions --- */
  {
    /* --------------------------------------------------
       name
       — The user's full name.
       — String     : must be text, not a number or object.
       — required   : MongoDB will reject a save if name
                      is missing.
       — trim       : automatically removes extra spaces
                      from both ends (e.g. "  Lokesh  "
                      becomes "Lokesh" before saving).
    -------------------------------------------------- */
    name: {
      type    : String,
      required: [true, "Name is required"],
      trim    : true,
    },

    /* --------------------------------------------------
       email
       — The user's email address.
       — String     : must be text.
       — required   : cannot save a user without an email.
       — unique     : no two users can have the same email.
                      MongoDB creates an index to enforce this.
       — lowercase  : automatically converts the email to
                      lowercase before saving so "User@Gmail.COM"
                      and "user@gmail.com" are treated as the same.
       — trim       : removes accidental leading/trailing spaces.
    -------------------------------------------------- */
    email: {
      type     : String,
      required : [true, "Email is required"],
      unique   : true,
      lowercase: true,
      trim     : true,
    },

    /* --------------------------------------------------
       password
       — The user's password.
       — String     : stored as text.
       — required   : cannot save a user without a password.
       — NOTE: Never store plain text passwords in a real app.
               In the next step you will hash this using bcrypt
               before saving. The schema itself just stores
               whatever string it receives.
    -------------------------------------------------- */
    password: {
      type    : String,
      required: [true, "Password is required"],
    },
  },

  /* --- Schema Options --- */
  {
    /* --------------------------------------------------
       timestamps: true
       — Tells Mongoose to automatically add two extra
         fields to every document:
           createdAt — the date/time the user was created
           updatedAt — the date/time the user was last changed
       — You do not need to set these manually; MongoDB
         handles them for you on every save and update.
    -------------------------------------------------- */
    timestamps: true,
  }

);


/* ============================================================
   SECTION 3 — CREATE THE MODEL
   — mongoose.model() takes the schema and turns it into
     a Model — the actual tool we use to talk to MongoDB.
   — First argument  "User" — the model name. Mongoose
     automatically looks for (or creates) a MongoDB
     collection called "users" (lowercase + plural).
   — Second argument userSchema — the schema we defined above.
   ============================================================ */

const User = mongoose.model("User", userSchema);


/* ============================================================
   SECTION 4 — EXPORT THE MODEL
   — module.exports makes User available to other files.
   — Any route or controller that needs to create, find,
     or delete a user will import it like this:
       const User = require("../models/User");
   ============================================================ */

module.exports = User; 