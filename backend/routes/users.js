const express = require('express');
const router = express.Router();
const usersController = require('../controller/usersController');
const auth = require('../middleware/auth');

// Only admin can manage users
router.use(auth());

router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.put('/:id/role', usersController.changeUserRole);

module.exports = router;
