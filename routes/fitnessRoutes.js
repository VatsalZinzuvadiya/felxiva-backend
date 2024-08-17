const express = require('express');
const router = express.Router();
const fitnessController = require('../controllers/fitnessController');
const verifyJWT = require('../middleware/verifyJWT')


router
  .route('/')
  .post(verifyJWT, fitnessController.addFitness)

module.exports = router;