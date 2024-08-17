const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema(
  {
    user_id: {type: mongoose.Schema.Types.ObjectId, require: true},
    service_id: { type: mongoose.Schema.Types.ObjectId, require: true },
    fitness_id:{type: mongoose.Schema.Types.ObjectId},
    provider_id: { type: mongoose.Schema.Types.ObjectId },
    bodyguard_id: { type: mongoose.Schema.Types.ObjectId },
    referral_id:{type: mongoose.Schema.Types.ObjectId},
    status: { type: String, enum: ["Pending","Started","Assigned","Accepted","Rejected", "Canceled", "Completed", "Finished"], default:"Pending"},
    cost: { type: Number, require: true },
    timestamp:{type: Date, default: Date.now()},
    service:{type: String, enum: ["massage", "fitness","Massage","Stretch", "Fitness"],},
    review:{ type: mongoose.Schema.Types.ObjectId },
    start_time:{type: Date},
    paidStatus:{
      type:String,
      default:"Unpaid"
    },
    paymentToProviderStatus:{
      type:String,
      default:"Pending",
      enum: ["Pending","Requested","Withdrawn","Approved","Rejected"]
    },
    paymentToReferralStatus:{
      type:String,
      default:"Pending",
      enum: ["Pending","Requested","Withdrawn","Approved","Rejected"]
    },
    razorpay_order_id: {
      type: String
    },
    razorpay_payment_id: {
      type: String
    },
    razorpay_signature: {
      type: String
    },
    ratingToCustomer:{
      type: Number,
      default: 0
    },
    ratingToProvider:{
      type:Number,
      default: 0
    },
    commentToCustomer:{
      type:String,
      default:""
    },
    commentToProvider:{
      type:String,
      default:""
    }
  }
);

module.exports = mongoose.model('appointment', appointmentSchema)
