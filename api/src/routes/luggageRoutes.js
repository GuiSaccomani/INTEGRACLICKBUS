const { Router } = require('express');
const luggageController = require('../controllers/luggageController');

const router = Router();

// Criação de bagagem vinculada à passagem via UT_HASH
router.post('/', luggageController.create);

// Consulta de bagagens associadas a uma passagem
router.get('/ticket/:ticketId', luggageController.getByTicket);

// Consulta individual de bagagem pelo BAGGAGE_ID (lido de tag NFC ou busca direta)
router.get('/:id', luggageController.getById);

// Remoção segura de bagagem (desembarque e liberação de tag)
router.delete('/:id', luggageController.remove);

module.exports = router;