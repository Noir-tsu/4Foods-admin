const express = require('express');
const router = express.Router();
const settingsController = require('../controller/settingsController');
const auth = require('../middleware/auth');

// Use admin-only middleware
router.use(auth());

router.get('/', settingsController.getAllSettings);
router.post('/', settingsController.createSetting);
router.get('/:key', settingsController.getSettingByKey);
router.put('/:key', settingsController.updateSetting);
router.delete('/:key', settingsController.deleteSetting);

module.exports = router;
