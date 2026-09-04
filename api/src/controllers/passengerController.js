const passengerService = require('../services/passengerService');

class PassengerController {
  async getTicket(req, res, next) {
    try {
      const { ticketId } = req.params;
      const result = await passengerService.getTicketDetails(ticketId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserTickets(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await passengerService.getUserTickets(userId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async validateTicket(req, res, next) {
    try {
      const { ticketId } = req.params;
      const { driverId } = req.body || {};
      const result = await passengerService.validateTicket(ticketId, driverId);
      return res.status(200).json({
        message: 'Embarque efetuado com sucesso!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async scanAndValidate(req, res, next) {
    try {
      const { ticketId, driverId } = req.body || {};
      const result = await passengerService.validateTicket(ticketId, driverId);
      return res.status(200).json({
        message: 'Embarque efetuado com sucesso!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async validateCredential(req, res, next) {
    try {
      const { credentialRef, driverId } = req.body || {};
      const result = await passengerService.validateCredential(credentialRef, driverId);
      return res.status(200).json({
        message: 'Embarque efetuado com sucesso!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PassengerController();