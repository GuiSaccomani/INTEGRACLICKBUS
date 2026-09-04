const luggageService = require('../services/luggageService');

class LuggageController {
  async create(req, res, next) {
    try {
      const { ticketId, baggageId } = req.body;
      const luggage = await luggageService.addLuggage(ticketId, baggageId);
      return res.status(201).json({
        message: 'Bagagem cadastrada com sucesso.',
        luggage,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByTicket(req, res, next) {
    try {
      const { ticketId } = req.params;
      const luggages = await luggageService.getByTicket(ticketId);
      return res.status(200).json({ luggages });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const luggage = await luggageService.getLuggageDetails(id);
      return res.status(200).json({ luggage });
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      await luggageService.removeLuggage(id);
      return res.status(200).json({
        message: 'Bagagem removida com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LuggageController();