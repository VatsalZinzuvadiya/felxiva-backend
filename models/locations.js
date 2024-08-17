// models/Location
const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  state:{type: String},
  city:{type: String},
  area: { type: String},

});



module.exports = mongoose.model("location", locationSchema);