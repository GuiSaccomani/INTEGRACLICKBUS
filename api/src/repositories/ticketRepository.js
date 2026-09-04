const db = require('../database');
const rawHelper = require('../utils/rawHelper');

class TicketRepository {
  /**
   * Busca os detalhes completos da passagem por TICKET_ID através dos JOINs oficiais:
   * TICKETS JOIN TRIPS JOIN USERS_TICKETS JOIN USERS
   * 
   * @param {string} ticketId - Hex ou UUID
   * @returns {Promise<object|null>}
   */
  async findById(ticketId) {
    const { hex } = rawHelper.normalizeRaw16(ticketId);

    const sql = `
      SELECT 
        RAWTOHEX(TK.TICKET_ID) AS TICKET_ID,
        RAWTOHEX(TK.TICKET_TRIP) AS TICKET_TRIP,
        TK.TICKET_SEAT,
        TK.TICKET_SOLD,
        TK.TICKET_USED,
        RAWTOHEX(TK.TICKET_TRANSIT_CARD) AS TICKET_TRANSIT_CARD,
        U.USER_NAME AS PASSENGER_NAME,
        RAWTOHEX(U.USER_ID) AS PASSENGER_ID,
        U.USER_EMAIL AS PASSENGER_EMAIL,
        RAWTOHEX(UT.UT_HASH) AS UT_HASH,
        TR.TRIP_DEPARTURE,
        TR.TRIP_ARRIVAL,
        TR.TRIP_DATE,
        TR.TRIP_OCUPATION
      FROM TICKETS TK
      JOIN TRIPS TR ON TR.TRIP_ID = TK.TICKET_TRIP
      LEFT JOIN USERS_TICKETS UT ON UT.UT_TICKET = TK.TICKET_ID
      LEFT JOIN USERS U ON U.USER_ID = UT.UT_USER
      WHERE TK.TICKET_ID = HEXTORAW(:ticketId)
    `;

    const result = await db.execute(sql, { ticketId: hex });
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return this._mapTicket(result.rows[0]);
  }

  /**
   * Busca os detalhes completos da passagem por UT_HASH (USERS_TICKETS.UT_HASH RAW(32))
   * USERS_TICKETS JOIN TICKETS JOIN TRIPS JOIN USERS
   * 
   * @param {string} utHash - Hex RAW(32)
   * @returns {Promise<object|null>}
   */
  async findByUtHash(utHash) {
    const { hex } = rawHelper.normalizeRaw32(utHash);

    const sql = `
      SELECT 
        RAWTOHEX(TK.TICKET_ID) AS TICKET_ID,
        RAWTOHEX(TK.TICKET_TRIP) AS TICKET_TRIP,
        TK.TICKET_SEAT,
        TK.TICKET_SOLD,
        TK.TICKET_USED,
        RAWTOHEX(TK.TICKET_TRANSIT_CARD) AS TICKET_TRANSIT_CARD,
        U.USER_NAME AS PASSENGER_NAME,
        RAWTOHEX(U.USER_ID) AS PASSENGER_ID,
        U.USER_EMAIL AS PASSENGER_EMAIL,
        RAWTOHEX(UT.UT_HASH) AS UT_HASH,
        TR.TRIP_DEPARTURE,
        TR.TRIP_ARRIVAL,
        TR.TRIP_DATE,
        TR.TRIP_OCUPATION
      FROM USERS_TICKETS UT
      JOIN TICKETS TK ON TK.TICKET_ID = UT.UT_TICKET
      JOIN TRIPS TR ON TR.TRIP_ID = TK.TICKET_TRIP
      JOIN USERS U ON U.USER_ID = UT.UT_USER
      WHERE UT.UT_HASH = HEXTORAW(:utHash)
    `;

    const result = await db.execute(sql, { utHash: hex });
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return this._mapTicket(result.rows[0]);
  }

  /**
   * Lista todas as passagens associadas a um usuário específico
   * @param {string} userId - Hex ou UUID
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    const { hex } = rawHelper.normalizeRaw16(userId);

    const sql = `
      SELECT 
        RAWTOHEX(TK.TICKET_ID) AS TICKET_ID,
        RAWTOHEX(TK.TICKET_TRIP) AS TICKET_TRIP,
        TK.TICKET_SEAT,
        TK.TICKET_SOLD,
        TK.TICKET_USED,
        RAWTOHEX(UT.UT_HASH) AS UT_HASH,
        U.USER_NAME AS PASSENGER_NAME,
        TR.TRIP_DEPARTURE,
        TR.TRIP_ARRIVAL,
        TR.TRIP_DATE,
        TR.TRIP_OCUPATION
      FROM USERS_TICKETS UT
      JOIN TICKETS TK ON TK.TICKET_ID = UT.UT_TICKET
      JOIN TRIPS TR ON TR.TRIP_ID = TK.TICKET_TRIP
      JOIN USERS U ON U.USER_ID = UT.UT_USER
      WHERE UT.UT_USER = HEXTORAW(:userId)
      ORDER BY TR.TRIP_DATE DESC
    `;

    const result = await db.execute(sql, { userId: hex });
    if (!result.rows) return [];
    return result.rows.map(row => this._mapTicket(row));
  }

  /**
   * Obtém a lista de passageiros de uma viagem
   * TRIPS -> TICKETS -> USERS_TICKETS -> USERS
   * 
   * @param {string} tripId - Hex ou UUID
   * @returns {Promise<Array>}
   */
  async findPassengersByTripId(tripId) {
    const { hex } = rawHelper.normalizeRaw16(tripId);

    const sql = `
      SELECT 
        RAWTOHEX(TK.TICKET_ID) AS TICKET_ID,
        TK.TICKET_SEAT,
        TK.TICKET_SOLD,
        TK.TICKET_USED,
        RAWTOHEX(UT.UT_HASH) AS UT_HASH,
        U.USER_NAME AS PASSENGER_NAME,
        U.USER_EMAIL AS PASSENGER_EMAIL,
        RAWTOHEX(U.USER_ID) AS PASSENGER_ID
      FROM TICKETS TK
      JOIN USERS_TICKETS UT ON UT.UT_TICKET = TK.TICKET_ID
      JOIN USERS U ON U.USER_ID = UT.UT_USER
      WHERE TK.TICKET_TRIP = HEXTORAW(:tripId)
      ORDER BY TK.TICKET_SEAT ASC
    `;

    const result = await db.execute(sql, { tripId: hex });
    if (!result.rows) return [];
    return result.rows.map(row => ({
      ticketId: row.TICKET_ID,
      seat: Number(row.TICKET_SEAT),
      sold: Number(row.TICKET_SOLD),
      used: Number(row.TICKET_USED),
      utHash: row.UT_HASH,
      passengerName: row.PASSENGER_NAME,
      passengerEmail: row.PASSENGER_EMAIL,
      passengerId: row.PASSENGER_ID,
    }));
  }

  /**
   * Executa a marcação atômica da passagem como utilizada (TICKET_USED = 1).
   * Garante proteção contra concorrência verificando TICKET_USED = 0 e TICKET_SOLD = 1.
   * 
   * @param {string} ticketId - Hex ou UUID
   * @param {object} [connection] - Conexão ativa para suporte a transação
   * @returns {Promise<number>} Número de linhas afetadas (1 = sucesso, 0 = falha/conflito)
   */
  async validateAndMarkUsed(ticketId, connection = null) {
    const { hex } = rawHelper.normalizeRaw16(ticketId);

    const sql = `
      UPDATE TICKETS
      SET TICKET_USED = 1
      WHERE TICKET_ID = HEXTORAW(:ticketId)
        AND TICKET_USED = 0
        AND TICKET_SOLD = 1
    `;

    const binds = { ticketId: hex };

    let result;
    if (connection) {
      result = await connection.execute(sql, binds);
    } else {
      result = await db.execute(sql, binds, { autoCommit: true });
    }

    return result.rowsAffected || 0;
  }

  /**
   * Cria uma nova passagem (para carga inicial e testes)
   * @param {object} ticket
   * @param {object} [connection]
   */
  async create(ticket, connection = null) {
    const ticketId = ticket.ticketId ? rawHelper.normalizeRaw16(ticket.ticketId).hex : rawHelper.generateRaw16().hex;
    const ticketTrip = rawHelper.normalizeRaw16(ticket.ticketTrip).hex;
    const transitCard = ticket.ticketTransitCard ? rawHelper.normalizeRaw16(ticket.ticketTransitCard).hex : null;

    const sql = `
      INSERT INTO TICKETS (
        TICKET_ID,
        TICKET_TRIP,
        TICKET_SEAT,
        TICKET_SOLD,
        TICKET_USED,
        TICKET_TRANSIT_CARD
      ) VALUES (
        HEXTORAW(:ticketId),
        HEXTORAW(:ticketTrip),
        :ticketSeat,
        :ticketSold,
        :ticketUsed,
        ${transitCard ? 'HEXTORAW(:transitCard)' : 'NULL'}
      )
    `;

    const binds = {
      ticketId,
      ticketTrip,
      ticketSeat: Number(ticket.ticketSeat),
      ticketSold: ticket.ticketSold !== undefined ? Number(ticket.ticketSold) : 1,
      ticketUsed: ticket.ticketUsed !== undefined ? Number(ticket.ticketUsed) : 0,
      ...(transitCard ? { transitCard } : {}),
    };

    if (connection) {
      await connection.execute(sql, binds);
    } else {
      await db.execute(sql, binds, { autoCommit: true });
    }

    return {
      ticketId,
      ticketTrip,
      ticketSeat: binds.ticketSeat,
      ticketSold: binds.ticketSold,
      ticketUsed: binds.ticketUsed,
      ticketTransitCard: transitCard,
    };
  }

  _mapTicket(row) {
    return {
      ticketId: row.TICKET_ID,
      tripId: row.TICKET_TRIP,
      seat: Number(row.TICKET_SEAT),
      sold: Number(row.TICKET_SOLD),
      used: Number(row.TICKET_USED),
      transitCardId: row.TICKET_TRANSIT_CARD || null,
      passengerName: row.PASSENGER_NAME || null,
      passengerId: row.PASSENGER_ID || null,
      passengerEmail: row.PASSENGER_EMAIL || null,
      utHash: row.UT_HASH || null,
      departure: row.TRIP_DEPARTURE || null,
      arrival: row.TRIP_ARRIVAL || null,
      tripDate: row.TRIP_DATE || null,
      tripOccupation: row.TRIP_OCUPATION || null,
    };
  }
}

module.exports = new TicketRepository();