const ticketRepository = require('../repositories/ticketRepository');
const luggageRepository = require('../repositories/luggageRepository');
const tripRepository = require('../repositories/tripRepository');

class PassengerService {
  /**
   * Consulta os detalhes reais da passagem no Oracle através das relações:
   * USERS JOIN USERS_TICKETS JOIN TICKETS JOIN TRIPS
   * 
   * @param {string} ticketId - Hex ou UUID
   * @returns {Promise<object>}
   */
  async getTicketDetails(ticketId) {
    if (!ticketId) {
      const error = new Error('Identificador do bilhete é obrigatório.');
      error.status = 400;
      throw error;
    }

    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      const error = new Error('Bilhete de passagem não encontrado.');
      error.status = 404;
      throw error;
    }

    const luggages = await luggageRepository.findByTicketId(ticketId);

    return {
      ticket: {
        ticketId: ticket.ticketId,
        tripId: ticket.tripId,
        passengerName: ticket.passengerName,
        passengerEmail: ticket.passengerEmail,
        seat: ticket.seat,
        departure: ticket.departure,
        arrival: ticket.arrival,
        tripDate: ticket.tripDate,
        sold: ticket.sold,
        used: ticket.used,
        utHash: ticket.utHash,
        transitCardId: ticket.transitCardId,
      },
      luggages: luggages.map(l => ({
        baggageId: l.baggageId,
        baggageUtHash: l.baggageUtHash,
      })),
    };
  }

  /**
   * Consulta todas as passagens de um usuário específico
   * @param {string} userId - Hex ou UUID
   * @returns {Promise<Array>}
   */
  async getUserTickets(userId) {
    if (!userId) {
      const error = new Error('Identificador do usuário é obrigatório.');
      error.status = 400;
      throw error;
    }

    const tickets = await ticketRepository.findByUserId(userId);
    return tickets;
  }

  /**
   * Executa a validação real da passagem com garantia de atomicidade no Oracle.
   * Verifica existência, status vendido, status não-utilizado e executa UPDATE condicional.
   * 
   * @param {string} ticketId 
   * @param {string} [driverId]
   * @returns {Promise<object>}
   */
  async validateTicket(ticketId, driverId = null) {
    if (!ticketId) {
      const error = new Error('Identificador da passagem é obrigatório.');
      error.status = 400;
      throw error;
    }

    // 1. Busca dados completos da passagem
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      const error = new Error('Bilhete de passagem não encontrado.');
      error.status = 404;
      throw error;
    }

    // 2. Validações de negócio prévias
    if (ticket.sold !== 1) {
      const error = new Error('A passagem não está confirmada/vendida no sistema.');
      error.status = 400;
      throw error;
    }

    if (ticket.used === 1) {
      const error = new Error('Conflito: Esta passagem já foi utilizada anteriormente.');
      error.status = 409;
      throw error;
    }

    // Se driverId fornecido, validar se a viagem do motorista confere
    if (driverId) {
      const trip = await tripRepository.findById(ticket.tripId);
      if (!trip || trip.tripDriver !== driverId) {
        const error = new Error('Validação negada: Este bilhete não pertence à viagem conduzida por este motorista.');
        error.status = 403;
        throw error;
      }
    }

    // 3. Atualização atômica para evitar dupla validação em caso de concorrência
    const rowsAffected = await ticketRepository.validateAndMarkUsed(ticket.ticketId);
    if (rowsAffected === 0) {
      const error = new Error('Conflito: A passagem não pôde ser validada (pode já ter sido marcada por outra requisição).');
      error.status = 409;
      throw error;
    }

    // 4. Busca bagagens associadas para retorno informativo
    const luggages = await luggageRepository.findByTicketId(ticket.ticketId);

    return {
      validated: true,
      ticketId: ticket.ticketId,
      passengerName: ticket.passengerName,
      seat: ticket.seat,
      departure: ticket.departure,
      arrival: ticket.arrival,
      used: 1,
      luggagesCount: luggages.length,
      luggagesDetails: luggages.map(l => ({
        baggageId: l.baggageId,
        baggageUtHash: l.baggageUtHash,
      })),
    };
  }

  /**
   * Mantém retrocompatibilidade com a rota anterior /passenger/nfc/scan
   */
  async captureNfcAndValidate(ticketId) {
    return this.validateTicket(ticketId);
  }

  /**
   * Valida uma credencial apresentada via QR Code ou NFC físico.
   * Não confia em dados passados pelo cliente; resolve no Oracle via:
   * credentialRef -> USERS_TICKETS (UT_HASH) -> TICKETS -> TRIPS -> USERS
   * 
   * @param {string} credentialRef - UT_HASH (64 hex chars), TICKET_ID (32 hex chars / UUID), ou string formatada
   * @param {string} [driverId] - Identificador do motorista autenticado
   * @returns {Promise<object>}
   */
  async validateCredential(credentialRef, driverId = null) {
    if (!credentialRef || typeof credentialRef !== 'string') {
      const error = new Error('Referência da credencial é obrigatória.');
      error.status = 400;
      throw error;
    }

    // Limpa prefixos conhecidos (ex: "integra:credential:v1:", "integra:ticket:v1:")
    let cleanRef = credentialRef.trim();
    if (cleanRef.includes(':')) {
      const parts = cleanRef.split(':');
      cleanRef = parts[parts.length - 1];
    }
    cleanRef = cleanRef.replace(/[^a-fA-F0-9]/g, '').toUpperCase();

    if (!cleanRef) {
      const error = new Error('Formato da credencial inválido ou ilegível.');
      error.status = 400;
      throw error;
    }

    let ticket = null;

    // Se for 64 hex chars -> Busca pelo UT_HASH de USERS_TICKETS
    if (cleanRef.length === 64) {
      ticket = await ticketRepository.findByUtHash(cleanRef);
    } else if (cleanRef.length === 32) {
      // Se for 32 hex chars -> Busca pelo TICKET_ID
      ticket = await ticketRepository.findById(cleanRef);
    } else {
      const error = new Error('Identificador da credencial com tamanho inválido.');
      error.status = 400;
      throw error;
    }

    if (!ticket) {
      const error = new Error('Credencial não encontrada no sistema.');
      error.status = 404;
      throw error;
    }

    // Executa a validação atômica utilizando o ID do bilhete localizado
    return this.validateTicket(ticket.ticketId, driverId);
  }
}

module.exports = new PassengerService();