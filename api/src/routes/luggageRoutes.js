const { Router } = require('express');
const luggageController = require('../controllers/luggageController');

const router = Router();

router.post('/', luggageController.create);
router.delete('/:id', luggageController.remove);

module.exports = router;