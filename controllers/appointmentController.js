const Appointment = require('../models/appointment');
const Commission = require('../models/commission');
const Provider = require('../models/provider');
const User = require('../models/user'); 
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const JWT_SECRET = process.env.Jwt_Secret_Key;

const getAppointment = async (req, res) => {
    try {
        const userId = req.userId;
        const results = await Appointment.aggregate([
            {
                $match: {
                    user_id: new ObjectId(userId)
                }
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
                $lookup: {
                    from: "users",
                    localField: "provider_id",
                    foreignField: "_id",
                    as: "providerData",
                },
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "review_id",
                    foreignField: "_id",
                    as: "reviewData",
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


const toggleStatus = async (req, res) => {
    const id = req.body.id;
    const status=req.body.status;
    console.log(req.body);
    try{
      const appointment_data = await  Appointment.findOne({ _id: id});
      if(status=="Started"){
         // if(prev_status.status=="Pending"){
            await Appointment.updateOne(
                { _id: id },
                {
                  $set: {
                    status: status,
                    start_time: Date.now()
                  } // Update the fields from the updateData object
                }
              )
              res.status(200).json({message: `Appointment ${status} Succesfully!`});
      }else if(status=="Rejected"){
        await User.updateOne(
          { _id: req.userId },
          {
            $inc: {
              rejectedOrders: 1,
            }
          }
        );

        await Appointment.updateOne(
          { _id: id },
          {
            $set: {
              status: status
            } 
          }
        );
        
        res.status(200).json({message: `Appointment ${status} Succesfully!`});
      }else if(status=="Finished" || status=="Completed"){

        if(appointment_data.referral_id){
          const referralCommission=await Commission.findOne({for:"Referral"});
          const referralData=await User.findById(appointment_data.referral_id);
          await User.updateOne(
            {_id:appointment_data.referral_id},
            {
              $set:{
                pendingEarning:referralData.pendingEarning+(appointment_data.cost*(referralCommission.percentage/100))
              }
            }
          )
        }

        const providerCommission=await Commission.findOne({for:"Provider"});
        const providerData=await Provider.findOne({userId:appointment_data.provider_id});
        await Provider.updateOne(
          {userId:appointment_data.provider_id},
          {
            $set:{
              pendingEarning:providerData.pendingEarning+(appointment_data.cost*(providerCommission.percentage/100))
            }
          }
        )
        await Appointment.updateOne(
          { _id: id },
          {
            $set: {
              status: status
            } 
          })
          res.status(200).json({message: `Appointment ${status} Succesfully!`});
      }else{
        await Appointment.updateOne(
            { _id: id },
            {
              $set: {
                status: status
              } 
            }
          )

          res.status(200).json({message: `Appointment ${status} Succesfully!`});
      }
      
    }catch(err){
      res.status(500).json(err);
    }
    
  };

module.exports = {
    getAppointment,
    toggleStatus
};
