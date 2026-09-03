const luggageService = require('../services/luggageService');

class LuggageController {
  async create(req, res) {
    try {
      const { ticketId } = req.body;
      const luggage = await luggageService.addLuggage(ticketId);
      return res.status(201).json({ message: "Bagagem cadastrada com sucesso.", luggage });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params;
      await luggageService.removeLuggage(id);
      return res.json({ message: "Bagagem removida com sucesso." });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = new LuggageController();