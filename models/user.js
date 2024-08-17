// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId
  },
  avatar: {
    type: String
  },
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String },
  phone: { type: Number },
  addressLine1: { type: String },
  addressLine2: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: Number },
  medicalCondition: {
    type: Boolean,
    default: false,
  },
  medicalConditionYesDetail: {
    type: String,
    default: "",
  },
  medication: {
    type: Boolean,
    default: false,
  },
  medicationYesDetail: {
    type: String,
    default: "",
  },
  fitnessWeightLossGoalDesc: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["user", "provider", "employee", "admin", "bodyguard"],
    default: "user",
  },
  availability: {
    type: String,
    default: "UnAvailable"
  },
  status: {
    type: Number,
  }
  ,
  timestamp: {
    type: Date,
    default: Date.now()
  },
  rejectedOrders: {
    type: Number
  },
  referralCode: {
    type: Number,
    unique: true,
    default: () => Math.floor(100000 + Math.random() * 900000)
  },
  noOfReferrals: {
    type: Number,
    default: 0
  },
  pendingEarning: {
    type: Number,
    default: 0
  },
  requestedEarning: {
    type: Number,
    default: 0
  },
  withdrawnEarning: {
    type: Number,
    default: 0
  },
  totalEarning: {
    type: Number,
    default: 0
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
