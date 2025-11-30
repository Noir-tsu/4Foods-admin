const express = require('express');
const router = express.Router();
const categoriesController = require('../controller/categoriesController');
const auth = require('../middleware/auth');

router.use(auth());

router.get('/', categoriesController.getAllCategories);
router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
