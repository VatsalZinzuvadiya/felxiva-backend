const mongoose = require('mongoose')

const membershipSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String,required: true },
    dob: { type: Date },
    gender: { type: String },
    phone: { type: Number },
    altPhone: { type: Number },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: Number },
    membershipType:{type: String},
    cost: { type: Number },
    location:{type: String},
    reasonToReject:{type: String},
    familyMembers:{type: Array},
    status:{type:String, default:"Pending"},
    payStats:{type:String, default:"Unpaid"}
  },
  {
    timestamps: true,
  }
)
module.exports = mongoose.model('membership', membershipSchema)
