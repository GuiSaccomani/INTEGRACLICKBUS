const tripRepository = require('../repositories/tripRepository');
const ticketRepository = require('../repositories/ticketRepository');
const luggageRepository = require('../repositories/luggageRepository');
const userRepository = require('../repositories/userRepository');

class DriverService {
  /**
   * Consulta as viagens reais de um motorista no Oracle
   * @param {string} driverId 
   * @returns {Promise<Array>}
   */
  async getDriverTrips(driverId) {
    if (!driverId) {
      const error = new Error('Identificador do motorista é obrigatório.');
      error.status = 400;
      throw error;
    }

    const driver = await userRepository.findById(driverId);
    if (!driver) {
      const error = new Error('Motorista não encontrado no sistema.');
      error.status = 404;
      throw error;
    }

    if (driver.userDriver !== 1) {
      const error = new Error('Acesso negado: Usuário não possui perfil de motorista.');
      error.status = 403;
      throw error;
    }

    const trips = await tripRepository.findByDriverId(driver.userId);
    return trips;
  }

  /**
   * Obtém a lista real de passageiros vinculados a uma viagem
   * Relação: TRIPS -> TICKETS -> USERS_TICKETS -> USERS
   * 
   * @param {string} tripId 
   * @returns {Promise<Array>}
   */
  async getTripPassengers(tripId) {
    if (!tripId) {
      const error = new Error('Identificador da viagem é obrigatório.');
      error.status = 400;
      throw error;
    }

    const trip = await tripRepository.findById(tripId);
    if (!trip) {
      const error = new Error('Viagem não encontrada.');
      error.status = 404;
      throw error;
    }

    const rawPassengers = await ticketRepository.findPassengersByTripId(trip.tripId);

    // Complementa cada passageiro com as bagagens associadas ao seu UT_HASH
    const passengersWithLuggage = await Promise.all(
      rawPassengers.map(async (p) => {
        let luggages = [];
        if (p.utHash) {
          luggages = await luggageRepository.findByUtHash(p.utHash);
        }
        return {
          ticketId: p.ticketId,
          seat: p.seat,
          passengerName: p.passengerName,
          passengerEmail: p.passengerEmail,
          status: p.used === 1 ? 'Embarcado' : 'Aguardando embarque',
          isBoarded: p.used === 1,
          baggageCount: luggages.length,
          hasBaggage: luggages.length > 0,
        };
      })
    );

    return passengersWithLuggage;
  }

  /**
   * Obtém resumo consolidado da viagem no Oracle (ocupação, embarcados, bagagens)
   * @param {string} tripId 
   */
  async getTripSummary(tripId) {
    if (!tripId) {
      const error = new Error('Identificador da viagem é obrigatório.');
      error.status = 400;
      throw error;
    }

    const summary = await tripRepository.getTripSummary(tripId);
    if (!summary) {
      const error = new Error('Viagem não encontrada.');
      error.status = 404;
      throw error;
    }

    return summary;
  }

  /**
   * Mantém retrocompatibilidade para endpoints existentes de emissão de sinal do motorista
   */
  async startNfcSignal(driverId) {
    const trips = await this.getDriverTrips(driverId);
    if (!trips || trips.length === 0) {
      const error = new Error('Nenhuma viagem encontrada para este motorista.');
      error.status = 404;
      throw error;
    }
    const currentTrip = trips[0];
    return {
      driverId,
      tripId: currentTrip.tripId,
      departure: currentTrip.tripDeparture,
      arrival: currentTrip.tripArrival,
      status: 'EMITTING_NFC_SIGNAL',
    };
  }

  async stopNfcSignal() {
    return { status: 'NFC_SIGNAL_STOPPED' };
  }
}

module.exports = new DriverService();