const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const otpSchema = mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    otp: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        expires: '30m',
        default: Date.now()
    }

});


module.exports = mongoose.model("otp", otpSchema);