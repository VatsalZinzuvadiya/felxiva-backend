const Fitness = require('../models/fitness');  // Rename the imported service model to Service
const Appointment=require("../models/appointment");

const addFitness = async (req, res) => {
  try {
    const userId=req.userId;
    const {
      fullName,
      email,
      dob,
      gender,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      medicalCondition,
      medicalConditionYesDetail,
      medication,
      medicationYesDetail,
      fitnessWeightLossGoalDesc,
      prevExerExp,
      prevExerExpDetail,
      age,
      height,
      weight,
      program,
      allergy,
      surgery,
      surgeryDetail,
      painDiscomfort,
      chronicMedicalConditions,
      healthcare,
      healthcareDetail,
      dietarySuppliments,
      dietarySupplimentsDetail,
      mobilityAids,
      smoking,
      smokingDetail,
      alcohol,
      alcoholConsumptionDetail,
      fitnessLevel,
      previousJoining,
      previousJoiningDetail,
      fitnessGoal,
      dailyDietaryIntake,
      dietryPreferenceRestriction,
      otherInfo,
    } = req.body;

    const newFitnessRecord = new Fitness({
      fullName,
      email,
      dob,
      gender,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      medicalCondition,
      medicalConditionYesDetail,
      medication,
      medicationYesDetail,
      fitnessWeightLossGoalDesc,
      prevExerExp,
      prevExerExpDetail,
      age,
      height,
      weight,
      program,
      allergy,
      surgery,
      surgeryDetail,
      painDiscomfort,
      chronicMedicalConditions,
      healthcare,
      healthcareDetail,
      dietarySuppliments,
      dietarySupplimentsDetail,
      mobilityAids,
      smoking,
      smokingDetail,
      alcohol,
      alcoholConsumptionDetail,
      fitnessLevel,
      previousJoining,
      previousJoiningDetail,
      fitnessGoal,
      dailyDietaryIntake,
      dietryPreferenceRestriction,
      otherInfo,
    });

    const savedFitnessRecord = await newFitnessRecord.save();
    if(savedFitnessRecord){
      const newAppointment = new Appointment({  // Changed 'Item' to 'Service'
        fitness_id: savedFitnessRecord._id,
        user_id: userId,
        service: "Fitness",
        cost:"80"
      });
  
      // Save the item to the MongoDB database
      await newAppointment.save();
    }
    res.status(200).json({message: "Record Saved Successfully"});
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  addFitness
};
