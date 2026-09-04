const { Router } = require('express');
const webauthnController = require('../controllers/webauthnController');

const router = Router();

// Registro de Biometria (Requer usuário autenticado)
router.post('/register/options', (req, res, next) => webauthnController.registerOptions(req, res, next));
router.post('/register/verify', (req, res, next) => webauthnController.registerVerify(req, res, next));

// Login com Biometria
router.post('/login/options', (req, res, next) => webauthnController.loginOptions(req, res, next));
router.post('/login/verify', (req, res, next) => webauthnController.loginVerify(req, res, next));

// Status e Gerenciamento
router.get('/status/:userId', (req, res, next) => webauthnController.status(req, res, next));
router.delete('/credentials/:credentialId', (req, res, next) => webauthnController.removeCredential(req, res, next));

module.exports = router;
