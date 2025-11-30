const express = require('express');
const router = express.Router();
const shopsController = require('../controller/shopsController');
const auth = require('../middleware/auth');

router.use(auth());

router.get('/', shopsController.getAllShops);
router.post('/', shopsController.createShop);
router.get('/:id', shopsController.getShopById);
router.put('/:id', shopsController.updateShop);
router.put('/:id/status', shopsController.changeShopStatus);
router.delete('/:id', shopsController.deleteShop);

module.exports = router;
