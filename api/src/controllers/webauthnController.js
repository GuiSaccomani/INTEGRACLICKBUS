const webauthnService = require('../services/webauthnService');

class WebauthnController {
  /**
   * POST /auth/webauthn/register/options
   */
  async registerOptions(req, res, next) {
    try {
      const { userId } = req.body;
      const options = await webauthnService.generateRegistrationOptions(userId, req);
      return res.status(200).json(options);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/webauthn/register/verify
   */
  async registerVerify(req, res, next) {
    try {
      const { userId, response } = req.body;
      const result = await webauthnService.verifyRegistration(userId, response, req);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/webauthn/login/options
   */
  async loginOptions(req, res, next) {
    try {
      const { email } = req.body || {};
      const result = await webauthnService.generateLoginOptions(email, req);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/webauthn/login/verify
   */
  async loginVerify(req, res, next) {
    try {
      const { response, challengeKey } = req.body || {};
      const result = await webauthnService.verifyLogin(response, challengeKey, req);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/webauthn/status/:userId
   */
  async status(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await webauthnService.getStatus(userId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /auth/webauthn/credentials/:credentialId
   */
  async removeCredential(req, res, next) {
    try {
      const { credentialId } = req.params;
      const { userId } = req.body || {};
      const result = await webauthnService.removeCredential(credentialId, userId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WebauthnController();
