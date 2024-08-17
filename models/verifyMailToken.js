const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const verifyMailTokenSchema = mongoose.Schema({
owner:{
    type:String,
    required:true,
},
token:{
    type:String,
    required:true,
},
created:{
    type:Date,
    expires:'30m',
    default:Date.now()
}

});

verifyMailTokenSchema.pre("save", async function (next){
    
         if(this.isModified('token')){
        const hash=await bcrypt.hash(this.token, 8);
        this.token = hash
    }
    next()
})

verifyMailTokenSchema.methods.compareToken = async function(token){
    const result = await bcrypt.compareSync(token, this.token)
    return result
}

module.exports = mongoose.model("verfiyMailToken", verifyMailTokenSchema);