const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId, require: true
  },
  service: {
    type: String,
    required: true,
  },
  serviceType:{
    type: String,
  },
  duration:{
    type:Number
  },
  peoples: {
    type: Number
  },
  gender:{
    type:String
  },
  fullName:{
    type:String
  },
  phone:{
    type: Number
  },
  addressLine1:{
    type:String
  },
  addressLine2:{
    type:String
  },
  city:{
    type:String
  },
  state:{
    type:String
  },
  zipCode:{
    type:String
  },
  country:{
    type:String
  },
  date:{
    type:Date
  },
 start_time:{
    type:String
  },
  end_time:{
    type:String
  },
  cost:{
    type:Number,
    default:0
  },
  transportation: {
    type: Number,
    default: 0
  },
  otherExpense:{
    type:Number,
    default:0
  },
  discount: {
    type: Number,
    default: 0
  },
  netAmount:{
    type:Number,
    default:0
  },
  GST: {
    type: Number,
    default: 0
  },
  totalAmount:{
    type:Number,
    default:0
  },
  status:{
    type:String,
    default:"Unpaid"
  },
  timestamp:{type: Date, default: Date.now()},
});

module.exports = mongoose.model("service", serviceSchema);