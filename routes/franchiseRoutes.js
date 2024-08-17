const express = require('express')
const router = express.Router()
const franchiseController = require('../controllers/franchiseController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/become-a-partner').post(franchiseController.createNewPartner)
router.route('/').get(franchiseController.getPartners)
router.route('/').put(franchiseController.updatePartner)
router.route('/').delete(franchiseController.deletePartner)



module.exports = router
