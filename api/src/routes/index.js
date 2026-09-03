const { Router } = require('express');
const driverRoutes = require('./driverRoutes');
const passengerRoutes = require('./passengerRoutes');
const luggageRoutes = require('./luggageRoutes');

const router = Router();

router.use('/driver', driverRoutes);
router.use('/passenger', passengerRoutes);
router.use('/luggages', luggageRoutes);

module.exports = router;