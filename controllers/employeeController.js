const Appointment = require('../models/appointment');
const Service = require('../models/service');
const Fitness = require('../models/fitness');
const User = require('../models/user');
const Bodyguard = require('../models/bodyguard');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const smtp_pass = process.env.SMTP_PASSWORD;
const smtp_mail = process.env.SMTP_EMAIL;


const JWT_SECRET = process.env.Jwt_Secret_Key;
// Configure Nodemailer with your SMTP server details
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

// @desc Create a employee
// @Route POST /employee
// @Private access
const createEmployee = async (req, res) => {
    const id = req.userId;
    const { fullName, email, phone, password, role } = req.body;

    try {
        // Fetch user from the database
        // Check for duplicate
        const duplicate = await User.findOne({ email }).lean().exec()
        if (duplicate) {
            return res.status(409).json({ message: 'Employee already exist' })
        }

        // Update the password with the new one
        const hashedPassword = await bcrypt.hash(password, 10);

        //create new user
        const newUser = await User.create({
            fullName,
            password: hashedPassword,
            email,
            role:role,
            avatar:req.file ? req.file.filename:"",
            phone,
            status:1
        });
        if(newUser){
            res.status(200).json({ message: "Employee Created successfully" });
        }else{
            res.status(400).json({ message: "Error in saving employee record!" });   
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// @desc Update an employee
// @Route PUT /employee?id=
// @Private access
const updateEmployee = async (req, res) => {
    const { id, fullName, email, phone, password, avatar } = req.body;

    try {
        // Fetch user from the database
        const user = await User.findById(id);

        // If no user is found
        if (!user) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Check for duplicate email in other records
        const duplicate = await User.findOne({ email: email, _id: { $ne: id } }).lean().exec();
        if (duplicate) {
            return res.status(409).json({ message: 'Another employee already uses this email' });
        }

        // If a new password is provided, hash it
        let updatedFields = {
            fullName,
            email,
            phone,
            avatar: req.file ? req.file.filename:user.avatar,
        };
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedFields.password = hashedPassword;
        }

        // Update the employee record
        const updatedUser = await User.findByIdAndUpdate(id, updatedFields, { new: true });

        if (updatedUser) {
            res.status(200).json({ message: "Employee updated successfully" });
        } else {
            res.status(400).json({ message: "Error updating employee record!" });
        }
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc Get all employees
// @Route GET /employees
// @Private access
const getEmployees = async (req, res) => {
    try {
        // Fetch all users with the role of 'employee' from the database
        const employees = await User.find({ role: { $in: ['employee', 'bodyguard'] } }).select('-password').lean().exec();

        // Check if employees exist
        if (!employees || employees.length === 0) {
            return res.status(404).json({ message: 'No employees found' });
        }

        // Send the list of employees
        res.status(200).json(employees);
    } catch (error) {
        console.error("Error retrieving employees:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



// @desc Delete an employee
// @Route DELETE /employee?id=
// @Private access
const deleteEmployee = async (req, res) => {
    const id = req.query.id; // Get employee ID from the URL parameter

    try {
        // Find the employee by ID and retrieve it before deletion to access any associated file info
        const employee = await User.findById(id);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Assume avatar is the field where the image filename is stored
        const avatarPath = employee.avatar;

        // Delete the employee document
        const deleted = await User.findByIdAndDelete(id);
        
        if (!deleted) {
            return res.status(404).json({ message: 'Error deleting the employee' });
        }

        // If there's an avatar to delete
        if (avatarPath) {
            const filePath = path.join(__dirname, '../images/', avatarPath);
            // Delete the file from the file system
            fs.unlink(filePath, err => {
                if (err) {
                    console.error("Failed to delete image file:", err);
                    // Handle file deletion error
                    return res.status(500).json({ message: 'Failed to delete associated image file' });
                }
                // Send success response
                res.status(200).json({ message: 'Employee and associated image deleted successfully' });
            });
        } else {
            // Send success response if no file needs to be deleted
            res.status(200).json({ message: 'Employee deleted successfully, no image found' });
        }
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



const getOrders = async (req, res) => {
    try {
        const results = await Appointment.aggregate([
            {
                $lookup: {
                    from: "services",
                    localField: "service_id",
                    foreignField: "_id",
                    as: "serviceData",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            {
                $lookup: {
                    from: "fitnesses",
                    localField: "fitness_id",
                    foreignField: "_id",
                    as: "fitnessData",
                },
            },

            {
                $match: {
                    provider_id: { $exists: false },
                    paidStatus: "Paid"
                }
            },
            {
                $sort: {
                    timestamp: -1  // Sorting in descending order based on createdAt field
                }
            }
        ]);
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const assignProvider = async (req, res) => {
    try {
        const appointmentId = req.body.appointmentId;
        const providerId = req.body.providerId;
        const bodyguardId = req.body.bodyguardId;
        let appointmentData = {};

        // Check if bodyguardId is present in the request body
        const updateFields = { provider_id: providerId, status: "Assigned" };
        const Providerdata = await User.findById(ObjectId(providerId));

        // console.log(Providerdata);
        if (bodyguardId) {
            updateFields.bodyguard_id = bodyguardId;
        }

        const appointment = await Appointment.findById(appointmentId);
        const customerData = await User.findById(ObjectId(appointment.user_id));
        if (appointment.service == "Fitness") {
            appointmentData = await Fitness.findById(ObjectId(appointment.fitness_id));
        } else {
            appointmentData = await Service.findById(ObjectId(appointment.service_id));
        }
        // console.log(appointment);
        if (appointment) {
            await Appointment.findByIdAndUpdate(
                { _id: appointmentId },
                { $set: updateFields }
            );

            //     const message =
            //         `Hi SOS Request!

            // Provider Assigned  To Employee :

            // *Price:*  INR*

            // We can't wait to provide you with a great experience! If you have any questions or need to reschedule, please don't hesitate to contact us.

            // See you soon!

            // Best regards,
            // *Flexiva*`;

            //     var options = {
            //         'method': 'POST',
            //         'url': 'https://whatsapp.pronauman.com/api/create-message',
            //         'headers': {
            //         },
            //         formData: {
            //             'appkey': 'fa006771-3b0a-474e-a3e0-3ad61ba0e022',
            //             'authkey': 'YmJx6i0fgUgZmWgVhHoOh87ZpyeHQ9H8cQyvJVrLFhlWcS3Nyo',
            //             'to': "923038876956",
            //             'message': message
            //         }
            //     };
            //     await request(options, function (error, response) {
            //         if (error) throw new Error(error);
            //         console.log(response.body);
            //     });
            // Define email content


            if (appointment.service == "Fitness") {
                const mailOptions = {
                    from: 'Flexiva Massage Center',
                    to: [Providerdata.email, customerData.email],
                    subject: `${"Provider Assigned"}`,
                    html: `
                    <p>Appointment Data: ${appointmentData}</p>
                  `,
                };

                // Send the email
                await transporter.sendMail(mailOptions);

                res.status(200).json({ message: 'Appointment updated successfully' });
            } else {
                const mailOptions = {
                    from: 'Flexiva Massage Center',
                    to: [Providerdata.email, customerData.email],
                    subject: `${"Order Assigned To Provider"}`,
                    html: `
                    <h3>Provider ${Providerdata.fullName} Assigned to ${customerData.fullName}'s Order</h3>
                    <h3>Details:</h3>
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

                res.status(200).json({ message: 'Appointment updated successfully' });
            }
        } else {
            res.status(400).json({ message: 'Appointment not found' });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const assignedOrders = async (req, res) => {
    try {
        const results = await Appointment.aggregate([
            {
                $lookup: {
                    from: "services",
                    localField: "service_id",
                    foreignField: "_id",
                    as: "serviceData",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            {
                $lookup: {
                    from: "fitnesses",
                    localField: "fitness_id",
                    foreignField: "_id",
                    as: "fitnessData",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "provider_id",
                    foreignField: "_id",
                    as: "providerData",
                },
            },
            {
                $lookup: {
                    from: "bodyguards",
                    localField: "bodyguard_id",
                    foreignField: "_id",
                    as: "bodyguardData",
                },
            },

            {
                $match: {
                    provider_id: { $exists: true }  // Filter records where provider_id is missing or null
                }
            },
            {
                $sort: {
                    timestamp: -1  // Sorting in descending order based on createdAt field
                }
            }
        ]);
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const getActiveProviders = async (req, res) => {
    try {
        console.log("coming");
        const results = await User.find({ role: { $in: ["Provider", "provider"] }, availability: "Available" });
        console.log(results);
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getClients = async (req, res) => {
    try {
        // console.log("coming");
        const results = await User.find({ role: "user" }).select('-password');
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getBodyguards = async (req, res) => {
    try {
        const results = await Bodyguard.find();
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const statData = async (req, res) => {
    console.log(req.params.date);
    try {
        const selectedDate = new Date(req.params.date);
        const currentDate = new Date();

        // Calculate the start date for the 7-day range
        const sevenDaysAgo = new Date(selectedDate);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Calculate the start and end dates for this month
        const thisMonthStart = moment(currentDate).startOf('month').toDate();
        const thisMonthEnd = moment(currentDate).endOf('month').toDate();

        // Calculate the start and end dates for last month
        const lastMonthStart = moment(currentDate).subtract(1, 'month').startOf('month').toDate();
        const lastMonthEnd = moment(currentDate).subtract(1, 'month').endOf('month').toDate();



        // Aggregation pipeline to get the desired records
        const appointmentResult = await Appointment.aggregate([
            {
                $match: {
                    timestamp: { $gte: sevenDaysAgo, $lte: selectedDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%d-%m-%Y', date: '$timestamp' },
                    },
                    services: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        const userResult = await User.aggregate([
            {
                $match: {
                    role: "user",
                    timestamp: { $gte: sevenDaysAgo, $lte: selectedDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%d-%m-%Y', date: '$timestamp' },
                    },
                    newUsers: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        const appointmentData = appointmentResult.map((item) => ({
            services: item.services,
            date: item._id,
        }));

        const userData = userResult.map((item) => ({
            newUsers: item.newUsers,
            date: item._id,
        }));

        // Query to find appointments for this month
        const thisMonthAppointments = await Appointment.find({
            start_time: { $gte: thisMonthStart, $lte: thisMonthEnd }
        });

        // Query to find appointments for last month
        const lastMonthAppointments = await Appointment.find({
            start_time: { $gte: lastMonthStart, $lte: lastMonthEnd }
        });


        // Calculate the difference in the number of appointments
        const profitPer = (thisMonthAppointments.length / lastMonthAppointments.length) * 100;
        // const lossPer = (lastMonthAppointments.length / thisMonthAppointments.length)*100;
        const lossPer = 100 - profitPer;

        res.json({
            appointments: appointmentData,
            users: userData,
            profit: profitPer
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getOrders,
    assignedOrders,
    assignProvider,
    getActiveProviders,
    getBodyguards,
    statData,
    getClients,
    createEmployee,
    updateEmployee,
    getEmployees,
    deleteEmployee
};