const express = require('express');
const router = express.Router();
const cartsCtrl = require('../controller/cartsController');
const auth = require('../middleware/auth');

router.use(auth());

router.get('/', cartsCtrl.getCarts);
router.get('/user/:userId', cartsCtrl.getCartByUser);
router.put('/:id', cartsCtrl.updateCart);
router.delete('/:id', cartsCtrl.deleteCart);

module.exports = router;
