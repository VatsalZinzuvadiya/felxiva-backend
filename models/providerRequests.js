const mongoose=require('mongoose');

const providerRequestSchema=mongoose.Schema({
    provider_id: {type: mongoose.Schema.Types.ObjectId, require: true},
    appointment_ids:{type:Array},
    amount:{type:Number, require:true},
    status:{type:String, default:"Pending"},
    reason:{type:String},
    timestamp: {
        type: Date,
        default: Date.now()
      },
})

module.exports = mongoose.model("providerRequest", providerRequestSchema);