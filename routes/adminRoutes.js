const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/userstomail')
  .get(verifyJWT, adminController.getAllUsers);

  router.route('/allOrders')
  .get(verifyJWT, adminController.getAllOrders);

  router.route('/allClients')
  .get(verifyJWT, adminController.getAllClients);

  router.route('/dashboard')
  .get(verifyJWT, adminController.getDashboardData);

  router.route('/chart')
  .post(verifyJWT, adminController.getChartData);
module.exports = router;
