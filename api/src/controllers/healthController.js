const db = require('../database');

class HealthController {
  async health(req, res) {
    return res.status(200).json({
      status: 'UP',
      service: 'integra-api',
      timestamp: new Date().toISOString(),
    });
  }

  async healthDb(req, res) {
    const healthResult = await db.checkHealth();
    const statusCode = healthResult.status === 'UP' ? 200 : 503;
    return res.status(statusCode).json(healthResult);
  }
}

module.exports = new HealthController();
