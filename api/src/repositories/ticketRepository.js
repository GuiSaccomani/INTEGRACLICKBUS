const db = require('../mocks/initialData');

class TicketRepository {
  async findById(id) {
    return db.tickets.find(t => t.id === id) || null;
  }

  async updateStatus(ticketId, status) {
    const ticket = db.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
    }
    return ticket;
  }
}

module.exports = new TicketRepository();