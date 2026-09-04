const { Router } = require('express');
const authController = require('../controllers/authController');
const webauthnRoutes = require('./webauthnRoutes');

const router = Router();

router.post('/login', authController.login);
router.get('/profile/:userId', authController.profile);

// Rotas Oficiais de Biometria / WebAuthn / Passkeys
router.use('/webauthn', webauthnRoutes);

module.exports = router;

