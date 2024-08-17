const express = require('express');
const router = express.Router();
const bodyguardController = require('../controllers/bodyguardController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/')
  .get(verifyJWT, bodyguardController.getBodyguards);

module.exports = router;