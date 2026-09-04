const driverService = require('../services/driverService');

class DriverController {
  async getTrips(req, res, next) {
    try {
      const { driverId } = req.params;
      const trips = await driverService.getDriverTrips(driverId);
      return res.status(200).json({ trips });
    } catch (error) {
      next(error);
    }
  }

  async getTripPassengers(req, res, next) {
    try {
      const { tripId } = req.params;
      const passengers = await driverService.getTripPassengers(tripId);
      return res.status(200).json({ passengers });
    } catch (error) {
      next(error);
    }
  }

  async getTripSummary(req, res, next) {
    try {
      const { tripId } = req.params;
      const summary = await driverService.getTripSummary(tripId);
      return res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  async startBroadcast(req, res, next) {
    try {
      const { driverId } = req.body;
      const result = await driverService.startNfcSignal(driverId);
      return res.status(200).json({
        message: 'Sinal NFC do motorista iniciado com sucesso.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async stopBroadcast(req, res, next) {
    try {
      const result = await driverService.stopNfcSignal();
      return res.status(200).json({
        message: 'Sinal NFC encerrado.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DriverController();