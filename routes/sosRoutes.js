const express = require('express')
const router = express.Router()
const sosController = require('../controllers/sosController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/')
.post(sosController.sosRequest)
.get(sosController.getSosRequests)
.delete(sosController.deleteRequests)


module.exports = router