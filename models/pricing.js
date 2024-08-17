// models/Price
const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  category:{type: String},
  subCategory:{type: String},
  serviceName: { type: String, unique: true},
  price: { type: Number },
  state:{type: String},
  city: { type: String},
  duration: { type: Number},
  discount:{type: Number, default: 0 },
  transportation:{type: Number, default: 0 },
  GST:{type:Number, default: 0},
  otherExpense:{type:Number, default: 0},
});

// priceSummarySchema.statics.getPrice = async function (city, timeDuration, serviceType, person) {
//   const filter = {
//     city,
//     timeDuration: timeDuration.toString(),
//     serviceType
//   };

//   const priceSummary = await this.findOne(filter);
//   if (!priceSummary) {
//     throw new Error("Price not found for the specified criteria");
//   }

//   return priceSummary.price;
// };

module.exports = mongoose.model("price", priceSchema);