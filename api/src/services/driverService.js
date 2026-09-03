const tripRepository = require('../repositories/tripRepository');

class DriverService {
  async startNfcSignal(driverId) {
    const trip = await tripRepository.findByDriverId(driverId);
    if (!trip) {
      throw { status: 404, message: "Nenhuma viagem encontrada para este motorista." };
    }
    await tripRepository.startBroadcast(driverId, trip.id);
    return { driverId, tripId: trip.id, status: "EMITTING_NFC_SIGNAL" };
  }

  async stopNfcSignal() {
    await tripRepository.stopBroadcast();
    return { status: "NFC_SIGNAL_STOPPED" };
  }
}

module.exports = new DriverService();