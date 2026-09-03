const driverService = require('../services/driverService');

class DriverController {
  async startBroadcast(req, res) {
    try {
      const { driverId } = req.body;
      const result = await driverService.startNfcSignal(driverId);
      return res.json({ message: "Sinal NFC do motorista iniciado com sucesso.", data: result });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async stopBroadcast(req, res) {
    try {
      const result = await driverService.stopNfcSignal();
      return res.json({ message: "Sinal NFC encerrado.", data: result });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = new DriverController();