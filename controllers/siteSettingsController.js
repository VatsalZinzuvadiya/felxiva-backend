const pricing = require("../models/pricing");
const package = require("../models/package");
const offer = require("../models/offers");
const location = require("../models/locations");

// @desc Create new pricing
// @Route POST /pricing

const createServicePricing = async (req, res) => {
  
  try {
    const ServiceNameExist = await pricing.findOne({serviceName:req.body.serviceName});
    if(ServiceNameExist){
      return res.status(400).json({message: "Service Name already Exist!"});
    }
    const { 
     category,
    subCategory,
    serviceName,
    price,
    state,
    city,
    duration,
    discount,
    transportation,
    GST,
    otherExpense
} = req.body;
console.log(req.body);
    //Confirm data
    if (
        !category ||
        !subCategory ||
        !serviceName ||
        !state ||
        !price ||
        !city ||
        !duration
    ) {
      return res
        .status(400)
        .json({ message: 'Verify your data and proceed again' })
    }

    //create new Pricing
    const newPricing = await pricing.create({
        category,
        subCategory,
        serviceName,
        price,
        state,
        city,
        duration,
        discount,
        transportation,
        GST,
        otherExpense
    })
    if (!newPricing) {
      return res.status(400).json({ message: 'Pricing creation failed, please verify your data and try again' });
    }
    const prices = await pricing.find();
    return res.status(200).json({ message: 'Your Pricing plan added successfully.', prices:prices });

  } catch (error) {
    console.error('An error occurred while processing the request:', error);
    return res.status(500).json({ message: 'An error occurred while processing your request. Please try again later.' });
  }
}

// @desc Update a pricing
// @Route PATCH /pricing
const updateServicePricing = async (req, res) => {
  const { _id } = req.body
    const {
        category,
        subCategory,
        serviceName,
        price,
        state,
        city,
        duration,
        discount,
        transportation,
        GST,
        otherExpense
    } = req.body;
  
    try {
      // Fetch pricing from the database
      const pricingData = await pricing.findById(_id);
  
      // If pricing is not found
      if (!pricingData) {
        return res.status(404).json({ message: "pricing not found" });
      }

  
      // Update pricing's other fields
      pricingData.category = category || pricingData.category;
      pricingData.subCategory = subCategory || pricingData.subCategory;
      pricingData.serviceName = serviceName || pricingData.serviceName;
      pricingData.price = price || pricingData.price;
      pricingData.state = state || pricingData.state;
      pricingData.city = city || pricingData.city;
      pricingData.duration = duration || pricingData.duration;
      pricingData.discount = discount || pricingData.discount;
      pricingData.transportation = transportation || pricingData.transportation;
      pricingData.GST = GST || pricingData.GST;
      pricingData.otherExpense = otherExpense || pricingData.otherExpense;




      // Save the updated pricing object
      await pricingData.save();
      const prices = await pricing.find();
      res.status(200).json({ message: "pricing updated successfully", prices });
    } catch (error) {
      console.error("Error updating pricing:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // @desc get pricings record
// @Route GET /pricing
const getServicePricing = async (req, res) => {

  try{
    const pricings = await pricing.find();
    res.status(200).json(pricings);
  }catch(e){
    return res
    .status(500)
    .json({ message: `Error in getting service pricings!` });
  }

}

  // @desc delete a pricing
// @Route DELETE /pricing
const deleteServicePricing = async (req, res) => {
    const { id } = req.body
  
    const deletepricing = await pricing.findById(id).exec()
    if (!deletepricing) {
      return res.status(400).json({ message: `Can't find a pricing with id: ${id}` })
    }
    const result = await deletepricing.deleteOne();
    if (!result) {
      return res
        .status(400)
        .json({ message: `Can't delete the pricing with id: ${id}` })
    }
    const prices = await pricing.find();
    res.json({ message: `pricing with id: ${id} deleted with success`, prices })
  }
// ----------------------------------

// @desc Create new package
// @Route POST /package

const createMemberPackage = async (req, res) => {
  try {
    const { 
      packageName,
      packageFor,
      city,
      price,
} = req.body;

    //Confirm data
    if (
      !packageName ||
      !packageFor ||
      !city ||
      !price

    ) {
      return res
        .status(400)
        .json({ message: 'Verify your data and proceed again' })
    }

    //create new package
    const newpackage = await package.create({
      packageName,
      packageFor,
      city,
      price,
    })
    if (!newpackage) {
      return res.status(400).json({ message: 'package creation failed, please verify your data and try again' });
    }
    const packages = await package.find();
    return res.status(200).json({ message: 'Your package plan added successfully.', packages });

  } catch (error) {
    console.error('An error occurred while processing the request:', error);
    return res.status(500).json({ message: 'An error occurred while processing your request. Please try again later.' });
  }
}

// @desc Update a package
// @Route PATCH /package
const updateMemberPackage = async (req, res) => {
  const { _id } = req.body
    const {
      packageName,
      packageFor,
      city,
      price,
    } = req.body;
  
    try {
      // Fetch package from the database
      const packageData = await package.findById(_id);
  
      // If package is not found
      if (!packageData) {
        return res.status(404).json({ message: "package not found" });
      }

  
      // Update package's other fields
      packageData.packageName = packageName || packageData.packageName;
      packageData.packageFor = packageFor || packageData.packageFor;
      packageData.price = price || packageData.price;
      packageData.city = city || packageData.city;



      // Save the updated package object
      await packageData.save();
      const packages = await package.find();
      res.status(200).json({ message: "package updated successfully", packages });
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


  // @desc delete a package
// @Route DELETE /package
const deleteMemberPackage = async (req, res) => {
    const { id } = req.body
  
    const deletepackage = await package.findById(id).exec()
    if (!deletepackage) {
      return res.status(400).json({ message: `Can't find a package with id: ${id}` })
    }
    const result = await deletepackage.deleteOne()
    if (!result) {
      return res
        .status(400)
        .json({ message: `Can't delete the package with id: ${id}` })
    }
    const packages = await package.find();
    res.json({ message: `package with id: ${id} deleted with success`, packages })
  }

      // @desc get Member Packages record
// @Route GET /Packages
const getMemberPackage = async (req, res) => {

  try{
    const packages = await package.find();
    res.status(200).json(packages);
  }catch(e){
    return res
    .status(500)
    .json({ message: `Error in getting offer!` });
  }

}

  // ----------------------------------

// @desc Create new offer
// @Route POST /offer

const createOffers = async (req, res) => {
  try {
    const { 
      voucherCode,
      title,
      discountType,
      amount,
} = req.body;

    //Confirm data
    if (
      !voucherCode ||
      !title ||
      !discountType ||
      !amount

    ) {
      return res
        .status(400)
        .json({ message: 'Verify your data and proceed again' })
    }

    //create new offer
    const newoffer = await offer.create({
      voucherCode,
      title,
      discountType,
      amount,
    })
    if (!newoffer) {
      return res.status(400).json({ message: 'offer creation failed, please verify your data and try again' });
    }
    const offers = await offer.find();
    return res.status(200).json({ message: 'Your offer plan added successfully.', offers });

  } catch (error) {
    console.error('An error occurred while processing the request:', error);
    return res.status(500).json({ message: 'An error occurred while processing your request. Please try again later.' });
  }
}

// @desc Update a offer
// @Route PATCH /offer
const updateOffers = async (req, res) => {
  const { _id } = req.body
    const {
      voucherCode,
      title,
      discountType,
      amount,
    } = req.body;
  
    try {
      // Fetch offer from the database
      const offerData = await offer.findById(_id);
  
      // If offer is not found
      if (!offerData) {
        return res.status(404).json({ message: "offer not found" });
      }

  
      // Update offer's other fields
      offerData.voucherCode = voucherCode || offerData.voucherCode;
      offerData.title = title || offerData.title;
      offerData.discountType = discountType || offerData.discountType;
      offerData.amount = amount || offerData.amount;



      // Save the updated offer object
      await offerData.save();
      const offers = await offer.find();
      res.status(200).json({ message: "offer updated successfully", offers });
    } catch (error) {
      console.error("Error updating offer:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


  // @desc delete a offer
// @Route DELETE /offer
const deleteOffers = async (req, res) => {
    const { id } = req.body
  
    const deleteoffer = await offer.findById(id).exec()
    if (!deleteoffer) {
      return res.status(400).json({ message: `Can't find a offer with id: ${id}` })
    }
    const result = await deleteoffer.deleteOne()
    if (!result) {
      return res
        .status(400)
        .json({ message: `Can't delete the offer with id: ${id}` })
    }
    const offers = await offer.find();
    res.json({ message: `offer with id: ${id} deleted with success`, offers })
  }

    // @desc get offer record
// @Route GET /offers
const getOffers = async (req, res) => {

  try{
    const offers = await offer.find();
    res.status(200).json(offers);
  }catch(e){
    return res
    .status(500)
    .json({ message: `Error in getting offer!` });
  }

}


// @Route GET /offers
const getDiscount= async (req, res) => {

  try{
    const code=req.body.code;
    console.log(code);
    const offers = await offer.findOne({voucherCode: code});
    console.log(offers);
    if(offers !=null){
      res.status(200).json(offers);
    }else{
      res.status(400).json({message: "Offer Not Exist!"});
    }
   
  }catch(e){
    return res
    .status(500)
    .json({ message: `Error in getting offer!` });
  }

}

    // ----------------------------------

// @desc Create new location
// @Route POST /location

const createLocations = async (req, res) => {
  try {
    const { 
      state,
      city,
      area,
} = req.body;

    //Confirm data
    if (
      !state ||
      !city 

    ) {
      return res
        .status(400)
        .json({ message: 'Verify your data and proceed again' })
    }

    //create new location
    const newlocation = await location.create({
      state,
      city,
      area,
    })
    if (!newlocation) {
      return res.status(400).json({ message: 'location creation failed, please verify your data and try again' });
    }
    const locations = await location.find();
    return res.status(200).json({ message: 'Your location added successfully.' , locations });

  } catch (error) {
    console.error('An error occurred while processing the request:', error);
    return res.status(500).json({ message: 'An error occurred while processing your request. Please try again later.' });
  }
}

// @desc Update a location
// @Route PATCH /location
const updateLocations = async (req, res) => {
  const { _id } = req.body
    const {
      state,
      city,
      area,
    } = req.body;
  
    try {
      // Fetch location from the database
      const locationData = await location.findById(_id);
  
      // If location is not found
      if (!locationData) {
        return res.status(404).json({ message: "location not found" });
      }

  
      // Update location's other fields
      locationData.state = state || locationData.state;
      locationData.city = city || locationData.city;
      locationData.area = area || locationData.area;




      // Save the updated location object
      await locationData.save();
      const locations = await location.find();
      res.status(200).json({ message: "location updated successfully", locations });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


  // @desc delete a location
// @Route DELETE /location
const deleteLocations = async (req, res) => {
    const { id } = req.body
  
    const deletelocation = await location.findById(id).exec()
    if (!deletelocation) {
      return res.status(400).json({ message: `Can't find a location with id: ${id}` })
    }
    const result = await deletelocation.deleteOne()
    if (!result) {
      return res
        .status(400)
        .json({ message: `Can't delete the location with id: ${id}` })
    }
    const locations = await location.find();
    res.json({ message: `location with id: ${id} deleted with success`, locations })
  }

  // @desc get location record
// @Route GET /locations
const getLocations = async (req, res) => {

  try{
    const locations = await location.find();
    res.status(200).json(locations);
  }catch(e){
    return res
    .status(500)
    .json({ message: `Error in getting locations!` });
  }

}

//   // @desc get cities record for specific state
// // @Route GET /locations
// const getCities = async (req, res) => {

//   try{
//     const locations = await location.find();
//     res.status(200).json(locations);
//   }catch(e){
//     return res
//     .status(500)
//     .json({ message: `Error in getting locations!` });
//   }

// }

module.exports = {
    createServicePricing,
    updateServicePricing,
    deleteServicePricing,
    getServicePricing,
    createMemberPackage,
    updateMemberPackage,
    deleteMemberPackage,
    getMemberPackage,
    createOffers,
    updateOffers,
    deleteOffers,
    getOffers,
    getDiscount,
    createLocations,
    updateLocations,
    deleteLocations,
    getLocations,
    
}