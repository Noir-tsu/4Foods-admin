const express = require('express');
const router = express.Router();
const msgCtrl = require('../controller/messagesController');
const auth = require('../middleware/auth');

router.use(auth());

router.get('/', msgCtrl.getMessages);
router.post('/', msgCtrl.createMessage);
router.put('/:id/read', msgCtrl.markAsRead);

module.exports = router;
