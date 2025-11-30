const express = require('express');
const router = express.Router();
const voucherCtrl = require('../controller/voucherController');
const auth = require('../middleware/auth');

router.use(auth());

router.get('/', voucherCtrl.getAllVouchers);
router.post('/', voucherCtrl.createVoucher);
router.put('/:id', voucherCtrl.updateVoucher);
router.delete('/:id', voucherCtrl.deleteVoucher);

module.exports = router;
