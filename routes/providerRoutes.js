const express = require('express')
const router = express.Router()
const providerController = require('../controllers/providerController')
const verifyJWT = require('../middleware/verifyJWT')
const multer = require('multer')

// const { v4: uuid } = require('uuid')

// -----------upload files multer--------------
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = "flexiva-"+Date.now();
    cb(null, uniqueSuffix);
  }
});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB, adjust as needed
  }
});

var type = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'certificate', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 }
]);

router.use(verifyJWT)
router.route('/')
      .post(type, providerController.createNewProvider)
      .get(providerController.getAssignedOrders)
      .patch(providerController.statusUpdate)
router.route('/Livelocation').post(type, providerController.StoreLocation)
router.route('/check-request').post(providerController.checkProviderDuplicateRequest)
router.route('/getLiveLocation').get(providerController.getLiveLocation)
router.route('/statData').get(providerController.statData)
router.route('/getProviders').get(providerController.getProviders)
router.route('/getAllProviders').get(providerController.getAllProviders)
router.route('/providerStatusUpdateByAdmin').put(providerController.providerStatusUpdateByAdmin)
router
  .route('/requestPayment')
  .post(providerController.requestPayment)
  router.route('/getOneProvider').get(providerController.getOneProvider)
module.exports = router
