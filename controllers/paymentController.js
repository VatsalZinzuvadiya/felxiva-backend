const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/paymentModel");
const Referral = require("../models/referral");
const Appointment = require('../models/appointment');
const User = require('../models/user');
const Service = require('../models/service');  // Rename the imported service model to Service
const Fitness = require('../models/fitness');  // Rename the imported service model to Service

const { ObjectId } = require('mongodb');
var request = require('request');



const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

const getKey = async (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
}

const checkout = async (req, res) => {
  try {
    // console.log("Data: ", req.body);
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };

    // console.log("options: ", options);
    const order = await instance.orders.create(options);

    console.log("order: ", order);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error in checkout:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const paymentVerification = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    console.log(req.body);
    if (isAuthentic) {
      // Database logic goes here

      const payment = await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      const prev_status = await Appointment.findOne({ _id: id });
      if (prev_status.paidStatus == "Unpaid") {
        await Appointment.updateOne(
          { _id: id },
          {
            $set: {
              paidStatus: "Paid",
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            }
          }
        )

        // const referralData=await Referral.findOne({user_id:prev_status.user_id , status:"Pending"}).lean().exec();
        // if(referralData){
        //   await Referral.updateOne(
        //     { user_id: prev_status.user_id, status:"Pending" },
        //     {
        //       $set: {
        //         appointment_id:  new ObjectId(id),
        //         status:"Purchased"
        //       } 
        //     }
        //   )
        // }

        if (prev_status.service != "Fitness") {
          await Service.updateOne(
            { _id: prev_status.service_id },
            {
              $set: {
                status: "Paid"
              }
            }
          )
        } else {
          await Fitness.updateOne(
            { _id: prev_status.fitness_id },
            {
              $set: {
                status: "Paid",
              }
            }
          )
        }


        console.log("Booked Appointment Successfully!");

      }
      res.redirect(
        `${process.env.REACT_APP_BASE_URL}/paymentsuccess/${id}`
      );
    } else {
      res.status(400).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error in paymentVerification:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const checkPaymentPaid = async (req, res) => {
  try {
    console.log("coming");
    const id=req.query.id;
    const paidAppointment = await Appointment.findOne({ _id: new ObjectId(id), paidStatus: "Paid" });

    if (paidAppointment) {
      if (paidAppointment.service === "Massage") {
        const serviceData = await Service.findById(paidAppointment.service_id);
        if (!serviceData) {
          return res.status(400).json({ message: "Service Data Not Found!" });
        }

        const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MmQzMWMyNzllMGNiMGMwMmFlNzkxNSIsIm5hbWUiOiJab3JvdmEiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjYyZDMxYzI3OWUwY2IwYzAyYWU3OTBjIiwiYWN0aXZlUGxhbiI6IkJBU0lDX01PTlRITFkiLCJpYXQiOjE3MTQyMzc4OTB9.-XPchz3ldZ99T6u-npytNBeKTG5z0D8J5zBiiRdoOY8",
            "campaignName": "Zorova_Order_Placed",
            "destination": `+${serviceData.phone}`,
            "userName": "Zorova",
            "templateParams": [
              `${serviceData.fullName}`,
              `${serviceData.service}`,
              `${serviceData.duration} Minutes`,
              `${serviceData.peoples}`,
             `${serviceData.serviceType}`,
              `${serviceData.date}`,
              `${serviceData.start_time} - ${serviceData.end_time}`,
              `${serviceData.addressLine1} ${serviceData.city}, ${serviceData.state}, ${serviceData.country}`,
              `${serviceData.totalAmount} INR`
            ],
            "source": "new-landing-page form",
            "media": {},
            "buttons": [],
            "carouselCards": [],
            "location": {}
          })
        });

        if (response.ok) {
          return res.status(200).json({ message: "Message Sent Successfully!" });
        } else {
          console.log(response.statusText);
          return res.status(500).json({ message: "Failed to send message!" });
        }
      } else {
        return res.status(200).json({ message: "Booking Successful But Failed to Send Message!" });
      }
    } else {
      return res.status(400).json({ message: "Record Not Exist!" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getKey,
  paymentVerification,
  checkout,
  checkPaymentPaid
};