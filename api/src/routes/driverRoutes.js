const { Router } = require('express');
const driverController = require('../controllers/driverController');

const router = Router();

router.post('/nfc/start', driverController.startBroadcast);
router.post('/nfc/stop', driverController.stopBroadcast);

module.exports = router;