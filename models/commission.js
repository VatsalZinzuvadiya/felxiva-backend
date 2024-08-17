// models/User.js
const mongoose = require("mongoose");

const commissionchema = new mongoose.Schema({
  for: { type: String},
  percentage: { type: Number }
});

module.exports = mongoose.model("commission", commissionchema);


