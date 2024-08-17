const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/')
  .get(verifyJWT, commissionController.getCommissions);

module.exports = router;