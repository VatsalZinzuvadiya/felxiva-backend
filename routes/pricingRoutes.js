const express = require('express')
const router = express.Router()
const priceController = require('../controllers/pricingController')


router
  .route('/')
  .post(priceController.addPrice)
  .get(priceController.fetchSpecificPrice);
router
  .route('/getPrice')
  .post(priceController.fetchSpecificPrice);

  module.exports = router