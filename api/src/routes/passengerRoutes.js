const { Router } = require('express');
const passengerController = require('../controllers/passengerController');

const router = Router();

// Consultar passagem específica
router.get('/ticket/:ticketId', passengerController.getTicket);

// Consultar todas as passagens do passageiro
router.get('/user/:userId/tickets', passengerController.getUserTickets);

// Download oficial de bilhete para Apple Wallet (.pkpass)
router.get('/ticket/:ticketId/wallet/pkpass', passengerController.downloadPkpass);

// Validação atômica da passagem diretamente por ticketId
router.post('/ticket/:ticketId/validate', passengerController.validateTicket);

// Validação segura por credencial/referência (UT_HASH ou TicketId de QR Code / NFC)
router.post('/credential/validate', passengerController.validateCredential);

// Retrocompatibilidade para validação NFC existente
router.post('/nfc/scan', passengerController.scanAndValidate);

module.exports = router;