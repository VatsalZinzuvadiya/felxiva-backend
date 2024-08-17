const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const verifyJWT = require('../middleware/verifyJWT')


router
  .route('/customer/')
  .post(verifyJWT, reviewController.addUpdateReviewByCustomer)
  .put(verifyJWT, reviewController.addUpdateReviewByProvider)
  .get(verifyJWT, reviewController.getReviews)

module.exports = router;