const db = require('../database');
const luggageRepository = require('../repositories/luggageRepository');
const usersTicketsRepository = require('../repositories/usersTicketsRepository');
const ticketRepository = require('../repositories/ticketRepository');
const rawHelper = require('../utils/rawHelper');

class LuggageService {
  /**
   * Cria e persiste uma nova bagagem associando ao UT_HASH oficial
   * Fluxo obrigatório:
   * 1. Validar existência do ticket
   * 2. Obter USERS_TICKETS.UT_HASH
   * 3. Persistir BAGGAGE_ID RAW(32) e BAGGAGE_UT_HASH dentro de transação com commit
   * 
   * @param {string} ticketId 
   * @param {string} [customBaggageId] - Opcional RAW(32) hex
   * @returns {Promise<object>}
   */
  async addLuggage(ticketId, customBaggageId = null) {
    if (!ticketId) {
      const error = new Error('Identificador do bilhete é obrigatório.');
      error.status = 400;
      throw error;
    }

    // 1. Valida existência do bilhete
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      const error = new Error('Passagem não encontrada.');
      error.status = 404;
      throw error;
    }

    // 2. Obtém a associação oficial USERS_TICKETS
    const association = await usersTicketsRepository.findByTicketId(ticket.ticketId);
    if (!association || !association.utHash) {
      const error = new Error('Associação de passageiro e passagem não encontrada (USERS_TICKETS). Não é possível vincular bagagem.');
      error.status = 400;
      throw error;
    }

    // 3. Define BAGGAGE_ID (RAW 32 bytes)
    const baggageIdHex = customBaggageId 
      ? rawHelper.normalizeRaw32(customBaggageId).hex 
      : rawHelper.generateRaw32().hex;

    // 4. Persiste no Oracle dentro de transação atômica (BEGIN -> INSERT -> COMMIT)
    const result = await db.withTransaction(async (connection) => {
      return await luggageRepository.create(baggageIdHex, association.utHash, connection);
    });

    return {
      baggageId: result.baggageId,
      baggageUtHash: result.baggageUtHash,
      ticketId: ticket.ticketId,
      passengerName: association.userName || ticket.passengerName,
      seat: ticket.seat,
    };
  }

  /**
   * Lista todas as bagagens associadas a uma passagem
   * @param {string} ticketId 
   */
  async getByTicket(ticketId) {
    if (!ticketId) {
      const error = new Error('Identificador do bilhete é obrigatório.');
      error.status = 400;
      throw error;
    }

    const luggages = await luggageRepository.findByTicketId(ticketId);
    return luggages;
  }

  /**
   * Consulta os detalhes de uma bagagem pelo seu BAGGAGE_ID RAW(32)
   * Respeita: BAGGAGE -> USERS_TICKETS -> TICKETS -> TRIPS -> USERS
   * @param {string} baggageId 
   */
  async getLuggageDetails(baggageId) {
    if (!baggageId) {
      const error = new Error('Identificador da bagagem é obrigatório.');
      error.status = 400;
      throw error;
    }

    const luggage = await luggageRepository.findDetailsById(baggageId);
    if (!luggage) {
      const error = new Error('Bagagem não encontrada no sistema.');
      error.status = 404;
      throw error;
    }

    return luggage;
  }

  /**
   * Remove uma bagagem com segurança transacional e verificação prévia
   * @param {string} baggageId 
   */
  async removeLuggage(baggageId) {
    if (!baggageId) {
      const error = new Error('Identificador da bagagem é obrigatório.');
      error.status = 400;
      throw error;
    }

    const baggage = await luggageRepository.findById(baggageId);
    if (!baggage) {
      const error = new Error('Bagagem não encontrada.');
      error.status = 404;
      throw error;
    }

    await db.withTransaction(async (connection) => {
      const rows = await luggageRepository.deleteById(baggageId, connection);
      if (rows === 0) {
        const error = new Error('Não foi possível remover a bagagem.');
        error.status = 500;
        throw error;
      }
    });

    return true;
  }
}

module.exports = new LuggageService();