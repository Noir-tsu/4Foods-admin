const express = require('express');
const router = express.Router();
const loyaltyCtrl = require('../controller/loyaltyController');
const auth = require('../middleware/auth');

router.use(auth());

router.get('/', loyaltyCtrl.getAllLoyalties);
router.put('/:id', loyaltyCtrl.updateLoyalty);

module.exports = router;
