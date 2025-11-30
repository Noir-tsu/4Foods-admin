const express = require('express');
const router = express.Router();
const productsController = require('../controller/productsController');
const auth = require('../middleware/auth');

router.use(auth()); // admin protected

router.get('/', productsController.getAllProducts);
router.post('/', productsController.createProduct);
router.get('/:id', productsController.getProductById);
router.put('/:id', productsController.updateProduct);
router.patch('/:id/status', productsController.changeProductStatus);
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
