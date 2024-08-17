const express = require('express')
const router = express.Router()
const serviceController = require('../controllers/serviceController')
const verifyJWT = require('../middleware/verifyJWT')


router.route('/').post(verifyJWT, serviceController.addService)

router.route('/:serviceId/cancel').patch(verifyJWT, serviceController.cancelService)

  module.exports = router