const provider = require("../models/provider");
const User = require("../models/user");
const livelocation = require("../models/livelocation");
const Appointment = require('../models/appointment');
const Provider = require('../models/provider');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const providerRequests = require("../models/providerRequests");

// @desc Create new provider
// @Route POST /provider
// @Access Private
const checkProviderDuplicateRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const duplicate = await provider.findOne({ userId: userId }).lean().exec();

    if (duplicate) {
      return res.status(400).json({ isDuplicate: true })
    }
    return res.status(200).json({ isDuplicate: false })
  } catch (error) {
    console.error('Error checking for duplicate provider request:', error);
    return { isDuplicate: false }; // Return false in case of error
  }
}

const createNewProvider = async (req, res) => {
  try {
    let aadharCard, photo, certificate;
    if (!req.files || !req.files['aadharCard']) {
      aadharCard = req.body.aadharcard;
    } else {
      aadharCard = req.files['aadharCard'][0].filename;
    }

    if (!req.files || !req.files['photo']) {
      photo = req.body.photo;
    } else {
      photo = req.files['photo'][0].filename;
    }

    if (!req.files || !req.files['certificate']) {
      certificate = req.body.certificate;
    } else {
      certificate = req.files['certificate'][0].filename;
    }

    const { userId, yearsOfExperience, areasOfSpecialization, services, areas, professionalRefrence1, professionalRefrence2 } = req.body;

    //Confirm data
    if (
      !userId ||
      !yearsOfExperience ||
      !professionalRefrence1 ||
      !professionalRefrence2 ||
      !services ||
      !areas

    ) {
      return res
        .status(400)
        .json({ message: 'Verify your data and proceed again' })
    }

    // Check for duplicate
    const duplicate = await provider.findOne({ userId: userId }).lean().exec()
    if (duplicate) {
      return res.status(400).json({ message: 'Your application is under process.' })
    }

    //create new provider
    const newProvider = await provider.create({
      userId,
      certificate,
      yearsOfExperience,
      areasOfSpecialization,
      services,
      areas,
      professionalRefrence1,
      professionalRefrence2,
      aadharCard,
      photo
    })
    if (!newProvider) {
      return res.status(400).json({ message: 'Provider creation failed, please verify your data and try again' });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { providerId: newProvider._id } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: 'Failed to update user with provider ID' });
    }

    return res.status(200).json({ message: 'Your Provider request is submitted successfully.' });

  } catch (error) {
    console.error('An error occurred while processing the request:', error);
    return res.status(500).json({ message: 'An error occurred while processing your request. Please try again later.' });
  }
}

const StoreLocation = async (req, res) => {
  try {
    const { providerId, latitude, longitude, altitude, heading, speed } = req.body;

    // Confirm data
    if (!providerId || !latitude || !longitude) {
      return res.status(400).json({ message: 'Verify your data and proceed again' });
    }

    // Check if the providerId already exists
    const existingLocation = await livelocation.findOne({ providerId }).lean().exec();


    if (existingLocation) {
      // If providerId exists, update the livelocation data
      const updatedLocation = await livelocation.findOneAndUpdate(
        { providerId },
        { latitude, longitude, altitude, heading, speed },
        { new: true }
      );

      if (!updatedLocation) {
        return res.status(400).json({ message: 'Failed to update location. Please try again.' });
      }

      return res.status(200).json({ message: 'Location updated successfully.' });
    } else {
      // If providerId doesn't exist, insert a new location record
      const newLocation = await livelocation.create({
        providerId,
        latitude,
        longitude,
        altitude,
        heading,
        speed
      });

      console.log("newLocation: ", newLocation);

      if (!newLocation) {
        return res.status(400).json({ message: 'Location storage failed. Verify your data and try again.' });
      }

      return res.status(200).json({ message: 'Provider request submitted successfully.' });
    }
  } catch (error) {
    console.error('An error occurred while processing the request:', error);
    return res.status(500).json({ message: 'An error occurred while processing your request. Please try again later.' });
  }
};

// @desc get pricings record
// @Route GET /getLiveLocation
const getLiveLocation = async (req, res) => {
  try {
    const providerId = req.query.providerId;
    const pricings = await livelocation.find({ providerId: providerId });
    res.status(200).json(pricings);
  } catch (e) {
    return res
      .status(500)
      .json({ message: `Error in getting live location details!` });
  }
}

const getAssignedOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const results = await Appointment.aggregate([
      {
        $match: {
          provider_id: new ObjectId(userId),
          status: { $in: ["Assigned", "Started", "Accepted", "Rejected", "Finished"] }
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
          localField: "user_id",
          foreignField: "_id",
          as: "customerData",
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

const statusUpdate = async (req, res) => {
  try {
    const userId = req.userId;
    const status = req.body.status;
    const results = await User.findById(userId);
    if (userId) {
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            availability: status
          } // Update the fields from the updateData object
        }
      )
      res.status(200).json(results);
    } else {
      res.status(400).json({ message: 'Record Not Exist!' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const statData = async (req, res) => {
  try {
    const userId = req.userId;
    const currentDate = new Date();

    // Calculate the start and end dates for this month
    const thisMonthStart = moment(currentDate).startOf('month').toDate();
    const thisMonthEnd = moment(currentDate).endOf('month').toDate();

    // Calculate the start and end dates for last month
    const lastMonthStart = moment(currentDate).subtract(1, 'month').startOf('month').toDate();
    const lastMonthEnd = moment(currentDate).subtract(1, 'month').endOf('month').toDate();


    // Query to find appointments for this month
    const thisMonthAppointments = await Appointment.find({
      provider_id: new ObjectId(userId),
      start_time: { $gte: thisMonthStart, $lte: thisMonthEnd }
    });

    // Query to find appointments for last month
    const lastMonthAppointments = await Appointment.find({
      provider_id: new ObjectId(userId),
      start_time: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });


    // Calculate the difference in the number of appointments
    const profitPer = (thisMonthAppointments.length / lastMonthAppointments.length) * 100;


    res.json({
      profit: profitPer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getProviders = async (req, res) => {
  try {
    const results = await User.find({ role: { $in: ["Provider", "provider"] } }).select('-password');
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllProviders = async (req, res) => {
  try {
    const results = await Provider.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      }
    ]);

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const providerStatusUpdateByAdmin = async (req, res) => {
  try {
    const providerId = req.body.providerId;
    const status = req.body.status;

    // Check if providerId is provided before making a database call
    if (!providerId) {
      return res.status(400).json({ message: 'Provider ID is required' });
    }

    // Use findOneAndUpdate to retrieve the updated document
    const updatedProvider = await Provider.findOneAndUpdate(
      { _id: providerId },
      { $set: { status: status } },
      { new: true, runValidators: true } // This ensures the updated document is returned
    );
    if (updatedProvider) {
      res.status(200).json(updatedProvider);
    } else {
      res.status(404).json({ message: 'Provider not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const requestPayment = async (req, res) => {
  try {
      console.log(req.body);
      const ids = req.body.ids;
      const amount = req.body.amount;
      const provider_id = req.userId;
      const newRequest = new providerRequests({
          amount: amount,
          appointment_ids: ids,
          provider_id: provider_id
      });
      const savedRequest = await newRequest.save();
      const userData = await Provider.findOne({userId: req.userId});
      await Provider.updateOne(
        {userId: req.userId},
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

const getOneProvider = async (req, res) => {
  const id = req.userId;

  if (!id) {
    console.log('Verify your data and proceed again r35476');
    return res
      .status(400)
      .json({ message: 'Verify your data and proceed again r35476' })
  }

  const oneProvider = await Provider.findOne({userId: id}).lean().exec();
  if (!oneProvider) {
    console.log(`Can't find a provider with this id: ${id}`);
    return res
      .status(400)
      .json({ message: `Can't find a provider with this id: ${id}` })
  } else {
    res.status(200).json(oneProvider)
  }
}

module.exports = {
  createNewProvider,
  checkProviderDuplicateRequest,
  StoreLocation,
  getLiveLocation,
  getAssignedOrders,
  statusUpdate,
  statData,
  getProviders,
  getAllProviders,
  providerStatusUpdateByAdmin,
  requestPayment,
  getOneProvider
}