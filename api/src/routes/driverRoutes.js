const { Router } = require('express');
const driverController = require('../controllers/driverController');

const router = Router();

// Consultas reais de motorista
router.get('/:driverId/trips', driverController.getTrips);
router.get('/trip/:tripId/passengers', driverController.getTripPassengers);
router.get('/trip/:tripId/summary', driverController.getTripSummary);

// Emissão e encerramento de sinal NFC do motorista
router.post('/nfc/start', driverController.startBroadcast);
router.post('/nfc/stop', driverController.stopBroadcast);

module.exports = router;