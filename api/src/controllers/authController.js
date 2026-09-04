const authService = require('../services/authService');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.status(200).json({
        message: 'Login realizado com sucesso.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async profile(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await authService.getProfile(userId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
