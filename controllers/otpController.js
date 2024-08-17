const { model } = require("mongoose")
const Sos = require("../models/sos")
const Appointment = require('../models/appointment');
const Otp = require('../models/otp');
const { ObjectId } = require('mongodb');
const User = require("../models/user");
const nodemailer = require('nodemailer');
const smtp_pass = process.env.SMTP_PASSWORD;
const smtp_mail = process.env.SMTP_EMAIL;

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: smtp_mail,
        pass: smtp_pass,
    },
    tls: {
        ciphers: 'TLSv1.2', 
    }
});


// @desc sendOtp
// @post /otp
// const sendOtp = async (req, res) => {
//     try {
//         const appointmentId = req.body.appointmentId;
//         const appointment = await Appointment.findById(ObjectId(appointmentId));
//         const userData = await User.findById(ObjectId(appointment.user_id))
//         const otp = Math.floor(100000 + Math.random() * 900000);

//         const otpRequest = await Otp.create({
//             appointmentId: appointmentId,
//             otp: otp
//         })

//         if (otpRequest) {
//             const mailOptions = {
//                 from: 'Flexiva Massage Center',
//                 to: userData.email,
//                 subject: `${"OTP Request"}`,
//                 html: `
//                     <h3>OTP ${userData.email} -> ${otp} </h3>
//                   `,
//             };
//             // Send the email
//             await transporter.sendMail(mailOptions);

//             res.status(200).json({ message: 'OTP sent to customer whatsapp number!' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// }

const sendOtp = async (req, res) => {
    try {
        const appointmentId = req.body.appointmentId;
        const appointment = await Appointment.findById(ObjectId(appointmentId));
        const userData = await User.findById(ObjectId(appointment.user_id));
        const otp = Math.floor(100000 + Math.random() * 900000);

        const otpRequest = await Otp.create({
            appointmentId: appointmentId,
            otp: otp
        });

        if (otpRequest) {
            // Prepare data for WhatsApp OTP request
            const data = {
                apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MmQzMWMyNzllMGNiMGMwMmFlNzkxNSIsIm5hbWUiOiJab3JvdmEiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjYyZDMxYzI3OWUwY2IwYzAyYWU3OTBjIiwiYWN0aXZlUGxhbiI6IkJBU0lDX01PTlRITFkiLCJpYXQiOjE3MTQyMzc4OTB9.-XPchz3ldZ99T6u-npytNBeKTG5z0D8J5zBiiRdoOY8",
                campaignName: "Zorova_Verification",
                destination: userData.phone,
                userName: "Zorova",
                templateParams: [userData.fullName, otp.toString(), "30"], // Assuming you have a name field in your User schema
                source: "new-landing-page form"
            };

            console.log(userData.phone, [userData.fullName, otp.toString(), "30"]);
            // Make HTTP POST request to send OTP via WhatsApp using fetch
            const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MmQzMWMyNzllMGNiMGMwMmFlNzkxNSIsIm5hbWUiOiJab3JvdmEiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjYyZDMxYzI3OWUwY2IwYzAyYWU3OTBjIiwiYWN0aXZlUGxhbiI6IkJBU0lDX01PTlRITFkiLCJpYXQiOjE3MTQyMzc4OTB9.-XPchz3ldZ99T6u-npytNBeKTG5z0D8J5zBiiRdoOY8",
                    "campaignName": "Zorova_Verification",
                    "destination": `+${userData.phone}`,
                    "userName": "Zorova",
                    "templateParams":[ 
                    `${userData.fullName}`,
                    `${otp}`,
                    "30"
                  ],
                    "source": "new-landing-page form",
                    "media": {},
                    "buttons": [],
                    "carouselCards": [],
                    "location": {}
                  })
            });

            // Check response status
            if (response.ok) {
                res.status(200).json({ message: `OTP sent to customer WhatsApp number ${userData.phone}` });
            } else {
                res.status(500).json({ message: `Failed to send OTP to WhatsApp number ${userData.phone}` });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// @desc sendOtp
// @get /otp
const verifyOtp = async (req, res) => {
    const { appointmentId, otp } = req.body;
    console.log(req.body);
    try {
        const otpData = await Otp.findOne({appointmentId,otp});
        if (otpData) {
            await Appointment.updateOne(
                { _id: appointmentId },
                {
                  $set: {
                    status: "Started",
                    start_time: Date.now()
                  } // Update the fields from the updateData object
                }
              )
              res.status(200).json({message: `Appointment Started Succesfully!`});
        } else {
            res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(400).json({ message: "OTP verification failed or expired" });
    }
}


const successOrder = async (req, res) => {
    try {
        const appointmentId = req.body.appointmentId;
        const appointment = await Appointment.findById(ObjectId(appointmentId));
        const userData = await User.findById(ObjectId(appointment.user_id));
        const otp = Math.floor(100000 + Math.random() * 900000);

        const otpRequest = await Otp.create({
            appointmentId: appointmentId,
            otp: otp
        });

        if (otpRequest) {
            // Prepare data for WhatsApp OTP request
            const data = {
                apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MmQzMWMyNzllMGNiMGMwMmFlNzkxNSIsIm5hbWUiOiJab3JvdmEiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjYyZDMxYzI3OWUwY2IwYzAyYWU3OTBjIiwiYWN0aXZlUGxhbiI6IkJBU0lDX01PTlRITFkiLCJpYXQiOjE3MTQyMzc4OTB9.-XPchz3ldZ99T6u-npytNBeKTG5z0D8J5zBiiRdoOY8",
                campaignName: "Zorova_Verification",
                destination: userData.phone,
                userName: "Zorova",
                templateParams: [userData.fullName, otp.toString(), "30"], // Assuming you have a name field in your User schema
                source: "new-landing-page form"
            };

            console.log(userData.phone, [userData.fullName, otp.toString(), "30"]);
            // Make HTTP POST request to send OTP via WhatsApp using fetch
            const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MmQzMWMyNzllMGNiMGMwMmFlNzkxNSIsIm5hbWUiOiJab3JvdmEiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjYyZDMxYzI3OWUwY2IwYzAyYWU3OTBjIiwiYWN0aXZlUGxhbiI6IkJBU0lDX01PTlRITFkiLCJpYXQiOjE3MTQyMzc4OTB9.-XPchz3ldZ99T6u-npytNBeKTG5z0D8J5zBiiRdoOY8",
                    "campaignName": "Zorova_Verification",
                    "destination": `+${userData.phone}`,
                    "userName": "Zorova",
                    "templateParams":[ 
                    `${userData.fullName}`,
                    `${otp}`,
                    "30"
                  ],
                    "source": "new-landing-page form",
                    "media": {},
                    "buttons": [],
                    "carouselCards": [],
                    "location": {}
                  })
            });

            // Check response status
            if (response.ok) {
                res.status(200).json({ message: `OTP sent to customer WhatsApp number ${userData.phone}` });
            } else {
                res.status(500).json({ message: `Failed to send OTP to WhatsApp number ${userData.phone}` });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    sendOtp,
    verifyOtp
}