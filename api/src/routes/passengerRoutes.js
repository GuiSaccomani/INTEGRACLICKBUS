const { Router } = require('express');
const passengerController = require('../controllers/passengerController');

const router = Router();

router.get('/ticket/:ticketId', passengerController.getTicket);
router.post('/nfc/scan', passengerController.scanAndValidate);

module.exports = router;