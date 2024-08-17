const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);
router
  .route('/')
  .get(referralController.getAllReferrals)

router
  .route('/getUserReferrals')
  .get(referralController.getUserReferrals)

router
  .route('/updatePaymentStatus')
  .put(referralController.updatePaymentStatus)

router
  .route('/requestPayment')
  .post(referralController.requestPayment)



module.exports = router;
