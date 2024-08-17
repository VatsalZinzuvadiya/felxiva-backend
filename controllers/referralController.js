const user = require('../models/user');
const Appointment = require('../models/appointment');
const Referral = require('../models/referral');
const { ObjectId } = require('mongodb');
const User = require('../models/user');


const getAllReferrals = async (req, res) => {
    try {
        const referrals = await Referral.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "referral_id",
                    foreignField: "_id",
                    as: "referralData",
                },
            },
        ]);
        res.json(referrals)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getUserReferrals = async (req, res) => {
    try {
        const referral_id = req.userId;
        const results = await Appointment.aggregate([
            {
                $match: {
                    referral_id: new ObjectId(referral_id)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "userData",
                },
            },
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
                    from: "fitnesses",
                    localField: "fitness_id",
                    foreignField: "_id",
                    as: "fitnessData",
                },
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
}

const requestPayment = async (req, res) => {
    try {
        console.log(req.body);
        const ids = req.body.ids;
        const amount = req.body.amount;
        const referral_id = req.userId;
        const newRequest = new Referral({
            amount: amount,
            appointment_ids: ids,
            referral_id: referral_id
        });
        const savedRequest = await newRequest.save();
        const userData = await User.findById(req.userId);
        await User.updateOne(
            { _id: req.userId },
            {
                $set: {
                    requestedEarning: userData.requestedEarning + amount,
                    pendingEarning: userData.pendingEarning - amount
                }
            }
        );
        if (savedRequest) {
            res.status(201).json({ message: "Request Sent Successfully!" });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Error in Request Sending!" });
    }

}

const updatePaymentStatus = async (req, res) => {
    const id = req.body.id;
    const amount = req.body.amount;
    const status = req.body.status;
    const reason = req.body.reason;
    const appointmentIds=req.body.appointment_ids;
    console.log(req.body);
    try {
        const prev_status = await Referral.findOne({ _id: id }).lean().exec();
        if (prev_status) {
            if (status == "Approved") {
                const userData = await User.findById(prev_status.referral_id);
                await User.updateOne(
                    { _id: prev_status.referral_id },
                    {
                        $set: {
                            withdrawnEarning: userData.withdrawnEarning + amount,
                            requestedEarning: userData.requestedEarning - amount
                        }
                    }
                );

                const filter = { _id: { $in: appointmentIds } }; // appointmentIds is an array containing the IDs of the appointments you want to update
                const update = { $set: { paymentToReferralStatus : 'Approved' } }; // 'UpdatedStatus' is the new status value you want to set

                const result = await Appointment.updateMany(filter, update);
            }

            const response = await Referral.updateOne(
                { _id: id },
                {
                    $set: {
                        status: status,
                        reason: reason ? reason : ""
                    }
                }
            )

            if (response) {
                res.status(200).json({ message: "Status Updated!" });
            } else {
                res.status(400).json({ message: "Error in Status Update!" });
            }
        }
    } catch (err) {
        res.status(500).json({ message: "Error in Status Update!" });
    }

};

module.exports = {
    getAllReferrals,
    getUserReferrals,
    updatePaymentStatus,
    requestPayment
}