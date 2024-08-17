// models/User.js
const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    required:true
  },
  timestamp:{
    type: Date,
    default: Date.now()
  }
});

const User = mongoose.model("Sos", sosSchema);

module.exports = User;
