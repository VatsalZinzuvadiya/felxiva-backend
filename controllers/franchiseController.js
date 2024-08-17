const Franchise = require('../models/franchise');

const createNewPartner = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      contact,
      email,
      businessInfo,
      currentBusiness,
      businessExperience,
      proposedLocation,
      businessPlan,
      financialInfo,
      availableInvestment,
      sourceOfFunding,
      canBringToOurNetwork,
      additionalInfo
    } = req.body;

    // Confirm data
    if (
      !fullName ||
      !dateOfBirth ||
      !contact ||
      !email ||
      !businessInfo ||
      !currentBusiness ||
      !businessExperience ||
      !proposedLocation ||
      !businessPlan ||
      !financialInfo ||
      !availableInvestment ||
      !sourceOfFunding ||
      !canBringToOurNetwork ||
      !additionalInfo
    ) {
      return res.status(400).json({ message: 'Verify your data and proceed again' });
    }

    // Check if email already exists
    const existingPartner = await Franchise.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ message: 'You have already submitted your request' });
    }

    // Create new partner
    const newPartner = await Franchise.create({
      fullName,
      dateOfBirth,
      contact,
      email,
      businessInfo,
      currentBusiness,
      businessExperience,
      proposedLocation,
      businessPlan,
      financialInfo,
      availableInvestment,
      sourceOfFunding,
      canBringToOurNetwork,
      additionalInfo
    });

    if (!newPartner) {
      return res.status(400).json({ message: 'Partner creation failed, please verify your data and try again' });
    }

    return res.status(200).json({ message: 'Your Partner request is submitted successfully.' });

  } catch (error) {
    console.error('An error occurred while processing the request:', error);
    return res.status(500).json({ message: 'An error occurred while processing your request. Please try again later.' });
  }
}

// @desc get  partners
// @Route GET /franchise
// @Private access
const getPartners = async (req, res) => {
  try {
      const results = await Franchise.find();
      res.status(200).json(results);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};


// @desc Update an partner status
// @Route PUT /franchise
// @Private access
const updatePartner = async (req, res) => {
  const { id, status, reason } = req.body;
  console.log(req.body);
  try {
      const partner = await Franchise.findById(id);
      if (!partner) {
          return res.status(404).json({ message: 'Partner not found' });
      }

      const updatedStatus = await Franchise.findByIdAndUpdate(id, { status:status, reasonToReject:reason}, { new: true });
      if (updatedStatus) {
          res.status(200).json({ message: "Partner status updated successfully" });
      } else {
          res.status(400).json({ message: "Error updating partner record!" });
      }

  } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};


// @desc DELETE an partner status
// @Route DELETE /franchise
// @Private access
const deletePartner = async (req, res) => {
  const { id} = req.body;
  console.log(req.body);
  try {
      const partner = await Franchise.deleteOne({_id:id});
      if (partner) {
          res.status(200).json({ message: "Partner deleted successfully" });
      } else {
          res.status(400).json({ message: "Error deleting partner record!" });
      }

  } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};
  
module.exports = {
   createNewPartner,
   getPartners,
   updatePartner,
   deletePartner
};
