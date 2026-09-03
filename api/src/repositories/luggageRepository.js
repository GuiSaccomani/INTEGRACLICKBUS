const db = require('../mocks/initialData');

class LuggageRepository {
  async findByTicketId(ticketId) {
    return db.luggages.filter(l => l.ticketId === ticketId);
  }

  async updateStatusByTicketId(ticketId, status) {
    const luggages = db.luggages.filter(l => l.ticketId === ticketId);
    luggages.forEach(l => l.status = status);
    return luggages;
  }

  async create(ticketId, status) {
    const newLuggage = {
      id: `LUG-${Date.now().toString().slice(-4)}`,
      ticketId,
      status
    };
    db.luggages.push(newLuggage);
    return newLuggage;
  }

  async deleteById(id) {
    const index = db.luggages.findIndex(l => l.id === id);
    if (index === -1) return false;
    db.luggages.splice(index, 1);
    return true;
  }
}

module.exports = new LuggageRepository();