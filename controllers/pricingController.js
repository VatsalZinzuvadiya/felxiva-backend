const PriceSummary = require('../models/pricing');
const Offer = require("../models/offers");

const addPrice = async (req, res) => {
  try {
    // Extract data from the request body
    const { serviceType, price, city, duration } = req.body;

    // Create a new PriceSummary document
    const newPriceSummary = await new PriceSummary({
      serviceType,
      price,
      city,
      duration
    });

    // Save the document to the database
    await newPriceSummary.save();

    res.status(201).json({ message: 'Price data added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const fetchSpecificPrice = async (req, res) => {
  try {
    const serviceType = req.body.serviceType;
    const duration = req.body.duration;
    const city = req.body.city;
    const persons = req.body.persons;
    const code = req.body.code || "";
    let discount = 0;

    // Fetch all price data from the database
    const result = await PriceSummary.findOne({
      subCategory: serviceType,
      duration,
      city
    });

    // console.log(price);
    if (result) {
      if (code != "") {
        const offers = await Offer.findOne({ voucherCode: code });
        console.log(offers);
        if (offers != null) {
          if (offers.discountType == "Percentage") {
           
            const cost = result.price * persons;
            const otherExpense = result.otherExpense;
            const transportation = result.transportation;
            discount= cost*(offers.amount/100);
            const netAmount = cost + otherExpense + transportation-discount;
            const gstPercentage = result.GST;
            const GST = (result.GST / 100) * netAmount;
            const totalAmount = netAmount + GST;

            // Send the fetched data as a response
           return res.status(200).json({ cost, otherExpense, transportation, discount, netAmount, gstPercentage, GST, totalAmount });
          }else{
            const cost = result.price * persons;
            const otherExpense = result.otherExpense;
            const transportation = result.transportation;
            const netAmount = cost + otherExpense + transportation-offers.amount;
            const gstPercentage = result.GST;
            const GST = (result.GST / 100) * netAmount;
            const totalAmount = netAmount + GST;

            // Send the fetched data as a response
            return res.status(200).json({ cost, otherExpense, transportation, discount, netAmount, gstPercentage, GST, totalAmount });
          }
        }else{
          return res.status(400).json({message: "Offer Not Exist!"});
        } 
      }

      const cost = result.price * persons;
      const otherExpense = result.otherExpense;
      const transportation = result.transportation;
      const netAmount = cost + otherExpense + transportation;
      const gstPercentage = result.GST;
      const GST = (result.GST / 100) * netAmount;
      const totalAmount = netAmount + GST;

      // Send the fetched data as a response
      res.status(200).json({ cost, otherExpense, transportation, discount, netAmount, gstPercentage, GST, totalAmount });
    } else {
      res.status(400).json({ message: `Price Does Not Exist in Databases for combination of ${serviceType} - ${duration} - ${city} ` });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  addPrice,
  fetchSpecificPrice
};