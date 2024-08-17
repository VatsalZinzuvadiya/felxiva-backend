// models/Package
const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  packageName:{type: String},
  packageFor:{type: String},
  city: { type: String},
  price: { type: Number },

});



module.exports = mongoose.model("package", packageSchema);