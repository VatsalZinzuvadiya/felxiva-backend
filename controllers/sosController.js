const { model } = require("mongoose")
const Sos = require("../models/sos")
const Appointment = require('../models/appointment');
const Service = require('../models/service');
const Fitness = require('../models/fitness');
const moment = require('moment');
const { ObjectId } = require('mongodb');
var request = require('request');
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
        ciphers: 'TLSv1.2', // Use TLSv1.2 instead of SSLv3
    },
});


const sosRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const appointmentId = req.body.appointmentId;
        const userData = await User.findById(userId);
        let appointmentData = {};
        console.log(appointmentId, req.body);
        const appointment = await Appointment.findById(appointmentId);
        if (appointment.service == "Fitness") {
            appointmentData = await Fitness.findById(ObjectId(appointment.fitness_id));
        } else {
            appointmentData = await Service.findById(ObjectId(appointment.service_id));
        }

        const sosRequest = await Sos.create({
            userId: userId
        })
        if (sosRequest && appointment) {
            // const message =
            //     `Hi SOS Request!

            // SOS request By ${userData.fullName} :

            // *Price:*  INR*

            // We can't wait to provide you with a great experience! If you have any questions or need to reschedule, please don't hesitate to contact us.

            // See you soon!

            // Best regards,
            // *Flexiva*`;

            // var options = {
            //     'method': 'POST',
            //     'url': 'https://whatsapp.pronauman.com/api/create-message',
            //     'headers': {
            //     },
            //     formData: {
            //         'appkey': 'fa006771-3b0a-474e-a3e0-3ad61ba0e022',
            //         'authkey': 'YmJx6i0fgUgZmWgVhHoOh87ZpyeHQ9H8cQyvJVrLFhlWcS3Nyo',
            //         'to': "923038876956",
            //         'message': message
            //     }
            // };
            // await request(options, function (error, response) {
            //     if (error) throw new Error(error);
            //     // console.log(response.body);
            // });

            if (appointment.service == "Fitness") {
                const mailOptions = {
                    from: 'Flexiva Massage Center',
                    to: "ammarqadri280@gmail.com",
                    subject: `${"SOS Request"}`,
                    html: `
                    <p>SOS Request: ${appointmentData}</p>
                  `,
                };

                // Send the email
                await transporter.sendMail(mailOptions);

                res.status(200).json({ message: 'SOS Request Sent!' });
            } else {
                const mailOptions = {
                    from: 'Flexiva Massage Center',
                    to: "ammarqadri280@gmail.com",
                    subject: `${"SOS Request"}`,
                    html: `
                    <h3>SOS Request Sent By ${userData.role} ${userData.fullName}</h3>
                    <h3>Order Details:</h3>
                    <p>Service ID: ${appointmentData._id}</p>
                    <p>Service Type: ${appointmentData.serviceType}</p>
                    <p>Date & Time: ${moment(appointmentData.date).format("YYYY-MM-DD")} |  ${appointmentData.start_time} -  ${appointmentData.end_time}</p>
                    <p>Duration: ${appointmentData.duration / 60} Minutes</P>
                    <p>Persons: ${appointmentData.peoples}</p>
                    <p>AddressLine1: ${appointmentData.addressLine1}</p>
                    <p>city: ${appointmentData.city}</p>
                    <p>state: ${appointmentData.state}</p>
                    <p>Zip Code: ${appointmentData.zipCode}</p>
                    <p>Price: INR ${appointmentData.totalAmount}</p>
                  `,
                };

                // Send the email
                await transporter.sendMail(mailOptions);

                res.status(200).json({ message: 'SOS Request Sent!' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getSosRequests = async (req, res) => {
    try {
        const sosRequests = await Sos.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData",
                },
            },
            {
                $sort: {
                    timestamp: -1  // Sorting in descending order based on createdAt field
                }
            }
        ]);
        if (sosRequests) {
            res.status(200).json(sosRequests);
        }
    } catch (e) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const deleteRequests = async (req, res) => {
   
    try {
        const sosId = req.body.sosId;
        const sosDeletedRequests = await Sos.findByIdAndDelete(sosId);
        if (sosDeletedRequests) {
            const sosRequests = await Sos.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userData",
                    },
                },
                {
                    $sort: {
                        timestamp: -1  // Sorting in descending order based on createdAt field
                    }
                }
            ]);
            if (sosRequests) {
                res.status(200).json({ message: "Sos Request Deleted!", sosRequests });
            }
        }
    } catch (e) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    sosRequest,
    getSosRequests,
    deleteRequests
}