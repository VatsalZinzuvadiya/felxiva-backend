const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/paymentController');
const verifyJWT = require('../middleware/verifyJWT');




router
  .route('/api/getkey')
  .get(verifyJWT, paymentController.getKey)

router
    .route("/api/checkout")
    .post(verifyJWT, paymentController.checkout);

router
    .route("/api/paymentverification")
    .post(paymentController.paymentVerification);

router
    .route("/api/checkPaymentPaid")
    .post(paymentController.checkPaymentPaid);

module.exports = router