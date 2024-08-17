const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/')
  .get(verifyJWT, appointmentController.getAppointment)
  .put(verifyJWT, appointmentController.toggleStatus);

module.exports = router;
