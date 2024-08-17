// models/Offers
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  voucherCode:{type: String},
  title:{type: String},
  discountType: { type: String},
  amount: { type: Number },

});



module.exports = mongoose.model("offer", offerSchema);