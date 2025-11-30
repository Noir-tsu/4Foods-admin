const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const auth = require('../middleware/auth');

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected: get current user
router.get('/me', auth({ adminOnly: false }), authController.me);

module.exports = router;
