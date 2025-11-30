const express = require('express');
const router = express.Router();
const convController = require('../controller/conversationsController');
const auth = require('../middleware/auth');

router.use(auth());

router.get('/', convController.getConversations);
router.post('/', convController.createConversation);
router.get('/:id', convController.getConversationById);
router.delete('/:id', convController.deleteConversation);

module.exports = router;
