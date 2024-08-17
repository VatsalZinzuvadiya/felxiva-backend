const mongoose = require('mongoose')

const franchiseSchema = new mongoose.Schema(
  {
    fullName: { type: String, require: true },
    dateOfBirth: { type: Date, required: true },
    contact: { type: Number, require: true },
    email: { type: String, require: true,unique: true, },
    businessInfo: { type: String, require: true },
    currentBusiness: { type: String, required: true },
    businessExperience: { type: String, required: true },
    proposedLocation: { type: String, require: true },
    businessPlan: { type: String, require: true },
    financialInfo: { type: String, require: true },
    availableInvestment: { type: String, required: true },
    sourceOfFunding: { type: String, require: true },
    canBringToOurNetwork: { type: String, require: true },
    additionalInfo: { type: String, require: true },
    status: { type: String, default: "Pending" },
    reasonToReject: { type: String },
  },
  {
    timestamps: true,
  }
)
module.exports = mongoose.model('franchise', franchiseSchema)
