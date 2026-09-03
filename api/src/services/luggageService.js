const ticketRepository = require('../repositories/ticketRepository');
const luggageRepository = require('../repositories/luggageRepository');

class LuggageService {
  async addLuggage(ticketId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw { status: 404, message: "Passagem não encontrada." };
    }

    const initialStatus = ticket.status === "CHECKED_IN" ? "CHECKED_IN" : "UNCHECKED";
    return await luggageRepository.create(ticketId, initialStatus);
  }

  async removeLuggage(luggageId) {
    const removed = await luggageRepository.deleteById(luggageId);
    if (!removed) {
      throw { status: 404, message: "Bagagem não encontrada." };
    }
    return true;
  }
}

module.exports = new LuggageService();