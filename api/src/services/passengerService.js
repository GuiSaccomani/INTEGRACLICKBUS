const tripRepository = require('../repositories/tripRepository');
const ticketRepository = require('../repositories/ticketRepository');
const luggageRepository = require('../repositories/luggageRepository');

class PassengerService {
  async getTicketDetails(ticketId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw { status: 404, message: "Bilhete de passagem não encontrado." };
    }

    const luggages = await luggageRepository.findByTicketId(ticketId);
    return { ticket, luggages };
  }

  async captureNfcAndValidate(ticketId) {
    // 1. Simula a escuta do NFC ativado pelo motorista
    const activeBroadcast = await tripRepository.getActiveBroadcast();
    if (!activeBroadcast) {
      throw { status: 400, message: "Nenhum sinal NFC de motorista foi detectado no momento." };
    }

    // 2. Busca o bilhete do passageiro
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw { status: 404, message: "Bilhete de passagem não encontrado." };
    }

    // 3. Valida se a viagem do sinal NFC do motorista bate com o bilhete
    if (ticket.tripId !== activeBroadcast.tripId) {
      throw { status: 400, message: "Validação falhou: A viagem informada pelo motorista não coincide com o seu bilhete." };
    }

    // 4. Salva e valida o passageiro e suas bagagens
    await ticketRepository.updateStatus(ticket.id, "CHECKED_IN");
    const updatedLuggages = await luggageRepository.updateStatusByTicketId(ticket.id, "CHECKED_IN");

    return {
      validated: true,
      passenger: ticket.passengerName,
      seat: ticket.seat,
      status: "CHECKED_IN",
      luggagesChecked: updatedLuggages.length,
      luggagesDetails: updatedLuggages
    };
  }
}

module.exports = new PassengerService();