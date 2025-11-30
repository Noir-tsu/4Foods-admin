const express = require('express');
const router = express.Router();
const notif = require('../controller/notificationsController');
const auth = require('../middleware/auth');

router.use(auth());

router.get('/', notif.getNotifications);
router.put('/:id/read', notif.markRead);
router.delete('/', notif.clearNotifications);

module.exports = router;
