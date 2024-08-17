const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);
router
  .route('/')
  .post(otpController.sendOtp)
  .put(otpController.verifyOtp)
//   .patch(notificationController.markOneNotificationasread);

// router
//   .route('/all')
//   .delete(notificationController.deleteAllNotifications)
//   .patch(notificationController.markAllNotificationsAsRead);

module.exports = router;
