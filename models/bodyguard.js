// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true }
});

const Bodyguard = mongoose.model("bodyguard", userSchema);

module.exports = Bodyguard;
