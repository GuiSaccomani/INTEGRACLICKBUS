const { Router } = require('express');
const healthController = require('../controllers/healthController');
const authController = require('../controllers/authController');
const authRoutes = require('./authRoutes');
const driverRoutes = require('./driverRoutes');
const passengerRoutes = require('./passengerRoutes');
const luggageRoutes = require('./luggageRoutes');

const router = Router();

// Health Check
router.get('/health', (req, res) => healthController.health(req, res));
router.get('/health/db', (req, res) => healthController.healthDb(req, res));

// Autenticação
router.use('/auth', authRoutes);
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Módulos
router.use('/driver', driverRoutes);
router.use('/passenger', passengerRoutes);
router.use('/luggages', luggageRoutes);

module.exports = router;