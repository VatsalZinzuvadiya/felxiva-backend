// models/User.js
const mongoose = require("mongoose");

const fitnessSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String },
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
  prevExerExp: {
    type: Boolean,
    default: false,
  },
  prevExerExpDetail: {
    type: String
  },
  age: {
    type: Number
  },
  height: {
    type: String
  },
  weight: {
    type: String
  },
  program: {
    type: String
  },
  allergy: {
    type: String
  },
  surgery: {
    type: Boolean,
    default: false,
  },
  surgeryDetail: {
    type: String
  },
  painDiscomfort: {
    type: String
  },
  chronicMedicalConditions: {
    type: String
  },
  healthcare: {
    type: Boolean,
    default: false,
  },
  healthcareDetail: {
    type: String
  },
  dietarySuppliments: {
    type: Boolean,
    default: false,
  },
  dietarySupplimentsDetail: {
    type: String
  },
  mobilityAids: {
    type: String
  },
  smoking: {
    type: Boolean,
    default: false,
  },
  smokingDetail: {
    type: String
  },
  alcohol: {
    type: Boolean,
    default: false,
  },
  alcoholConsumptionDetail: {
    type: String
  },
  fitnessLevel: {
    type: String
  },
  previousJoining: {
    type: Boolean,
    default: false,
  },
  previousJoiningDetail: {
    type: String
  },
  fitnessGoal: {
    type: String
  },
  dailyDietaryIntake: {
    type: String
  },
  dietryPreferenceRestriction: {
    type: String
  },
  otherInfo: {
    type: String
  },
  GST: {
    type: Number,
    default: 0
  },
  transportation: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    default: 0
  },
  status:{
    type:String,
    default:"Unpaid"
  },
  timestamp:{
    type:Date,
    default:Date.now()
  }


});

const fitness = mongoose.model("fitness", fitnessSchema);

module.exports = fitness;
