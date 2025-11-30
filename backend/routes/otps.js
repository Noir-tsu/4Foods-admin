const express = require('express');
const router = express.Router();
const otpCtrl = require('../controller/otpController');
const auth = require('../middleware/auth');

router.post('/', otpCtrl.createOtp);
router.post('/verify', otpCtrl.verifyOtp);

module.exports = router;
