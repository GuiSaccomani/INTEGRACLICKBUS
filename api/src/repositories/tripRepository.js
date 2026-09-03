const db = require('../mocks/initialData');

class TripRepository {
  async findByDriverId(driverId) {
    return db.trips.find(t => t.driverId === driverId) || null;
  }

  async startBroadcast(driverId, tripId) {
    db.activeNfcBroadcast = { driverId, tripId, activeAt: new Date() };
    return db.activeNfcBroadcast;
  }

  async stopBroadcast() {
    db.activeNfcBroadcast = null;
    return true;
  }

  async getActiveBroadcast() {
    return db.activeNfcBroadcast;
  }
}

module.exports = new TripRepository();