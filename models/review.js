const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  appointmentId:{
    type: mongoose.Schema.Types.ObjectId, require: true
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId, require: true
  },
  providerId:{
    type: mongoose.Schema.Types.ObjectId, require: true
  },
  ratingToCustomer:{
    type: Number,
    default: 5
  },
  ratingToProvider:{
    type:Number,
    default: 5
  },
  commentToCustomer:{
    type:String,
    default:""
  },
  commentToProvider:{
    type:String,
    default:""
  }
});

module.exports = mongoose.model("review", reviewSchema);