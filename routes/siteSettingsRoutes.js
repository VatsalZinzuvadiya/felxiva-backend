const express = require('express')
const router = express.Router()
const siteSettingsController = require('../controllers/siteSettingsController')
const verifyJWT = require('../middleware/verifyJWT')

// service pricing routes
router.route('/service-pricing')
.post(siteSettingsController.createServicePricing)
.patch(siteSettingsController.updateServicePricing)
.delete(siteSettingsController.deleteServicePricing)
.get(siteSettingsController.getServicePricing)
// service member package
router.route('/member-package')
.post(siteSettingsController.createMemberPackage)
.patch(siteSettingsController.updateMemberPackage)
.delete(siteSettingsController.deleteMemberPackage)
.get(siteSettingsController.getMemberPackage)

// service offers
router.route('/offers')
.post(siteSettingsController.createOffers)
.patch(siteSettingsController.updateOffers)
.delete(siteSettingsController.deleteOffers)
.get(siteSettingsController.getOffers)
.put(siteSettingsController.getDiscount)

// locations

router.route('/locations')
.post(siteSettingsController.createLocations)
.patch(siteSettingsController.updateLocations)
.delete(siteSettingsController.deleteLocations)
.get(siteSettingsController.getLocations)

router.use(verifyJWT)

module.exports = router
