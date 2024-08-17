const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT)
router.route('/').get(membershipController.getMembers);
router.route('/').put(membershipController.updateMember);
router.route('/').delete(membershipController.deleteMember);

module.exports = router;