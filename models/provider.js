// models/Provider.js
const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId, require: true
      },
  certificate: { type: String },
  yearsOfExperience: { type: Number },
  areasOfSpecialization:{ type: Array },
  services:{ type: String },
  areas:{ type: String },
  aadharCard:{ type: String },
  photo:{ type: String },
  professionalRefrence1:{
        fullName: { type: String,  },
        relationship: { type: String,  },
        phone: { type: Number },
    },
    professionalRefrence2:{
        fullName: { type: String,  },
        relationship: { type: String,  },
        phone: { type: Number },
    },
    rejectedOrders:{
        type:Number,
        default:0
    },
    acceptedOrders:{
        type:Number,
        default:0
    },
    pendingEarning:{
        type:Number,
        default:0
    },
    requestedEarning:{
        type:Number,
        default:0
    },
    withdrawnEarning:{
        type:Number,
        default:0
    },
    totalEarning:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        default:"Pending"
    },
    timestamp: {
        type: Date,
        default: Date.now()
      },   

});

const Provider = mongoose.model("Provider", providerSchema);

module.exports = Provider;
