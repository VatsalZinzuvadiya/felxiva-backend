const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const multer = require('multer')
const verifyJWT = require('../middleware/verifyJWT')

const { v4: uuid } = require('uuid')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images/')
  },
  filename: (req, file, cb) => {
    const fileName =
      'profileimage' +
      uuid().toString() +
      '_' +
      file.originalname.toLowerCase().split(' ').join('-')
    cb(null, fileName)
  },
})


const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype == 'image/jpg'
  ) {
    cb(null, true)
  } else {
    cb('Only .png, .jpg and .jpeg image format allowed!', false)
  }
}


const upload = multer({ storage, fileFilter, limits: 1024 * 1024 * 5 })


router.use(verifyJWT);
router
  .route('/newOrders')
  .get(employeeController.getOrders)

  router
  .route('/assignedOrders')
  .get(employeeController.assignedOrders)
  
  router
  .route('/getActiveProviders')
  .get(employeeController.getActiveProviders)

  router
  .route('/getBodyguards')
  .get(employeeController.getBodyguards)

  router
  .route('/assignProvider')
  .post(employeeController.assignProvider)

  router
  .route('/statData/:date')
  .get(employeeController.statData)

  router
  .route('/getClients')
  .get(employeeController.getClients)

  router
  .route('/')
  .post(upload.single("avatar"),employeeController.createEmployee)
  .put(upload.single("avatar"),employeeController.updateEmployee)
  .get(employeeController.getEmployees)
  .delete(employeeController.deleteEmployee)

module.exports = router;