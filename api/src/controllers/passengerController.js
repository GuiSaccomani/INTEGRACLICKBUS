const passengerService = require('../services/passengerService');

class PassengerController {
  async getTicket(req, res) {
    try {
      const { ticketId } = req.params;
      const result = await passengerService.getTicketDetails(ticketId);
      return res.json(result);
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async scanAndValidate(req, res) {
    try {
      const { ticketId } = req.body;
      const result = await passengerService.captureNfcAndValidate(ticketId);
      return res.json({ message: "Embarque efetuado com sucesso!", data: result });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = new PassengerController();