const db = require('../database');
const rawHelper = require('../utils/rawHelper');

class LuggageRepository {
  /**
   * Busca as bagagens vinculadas a um UT_HASH específico
   * @param {string} utHash - Hex RAW(32)
   * @returns {Promise<Array>}
   */
  async findByUtHash(utHash) {
    const { hex } = rawHelper.normalizeRaw32(utHash);

    const sql = `
      SELECT 
        RAWTOHEX(B.BAGGAGE_ID) AS BAGGAGE_ID,
        RAWTOHEX(B.BAGGAGE_UT_HASH) AS BAGGAGE_UT_HASH
      FROM BAGGAGE B
      WHERE B.BAGGAGE_UT_HASH = HEXTORAW(:utHash)
    `;

    const result = await db.execute(sql, { utHash: hex });
    if (!result.rows) return [];
    return result.rows.map(row => this._mapLuggage(row));
  }

  /**
   * Busca as bagagens associadas a uma passagem via JOIN com USERS_TICKETS
   * @param {string} ticketId - Hex RAW(16)
   * @returns {Promise<Array>}
   */
  async findByTicketId(ticketId) {
    const { hex } = rawHelper.normalizeRaw16(ticketId);

    const sql = `
      SELECT 
        RAWTOHEX(B.BAGGAGE_ID) AS BAGGAGE_ID,
        RAWTOHEX(B.BAGGAGE_UT_HASH) AS BAGGAGE_UT_HASH,
        RAWTOHEX(UT.UT_TICKET) AS TICKET_ID,
        RAWTOHEX(UT.UT_USER) AS USER_ID,
        U.USER_NAME AS PASSENGER_NAME
      FROM BAGGAGE B
      JOIN USERS_TICKETS UT ON UT.UT_HASH = B.BAGGAGE_UT_HASH
      JOIN USERS U ON U.USER_ID = UT.UT_USER
      WHERE UT.UT_TICKET = HEXTORAW(:ticketId)
    `;

    const result = await db.execute(sql, { ticketId: hex });
    if (!result.rows) return [];
    return result.rows.map(row => ({
      ...this._mapLuggage(row),
      ticketId: row.TICKET_ID,
      userId: row.USER_ID,
      passengerName: row.PASSENGER_NAME,
    }));
  }

  /**
   * Busca uma bagagem pelo seu BAGGAGE_ID RAW(32)
   * @param {string} baggageId - Hex RAW(32)
   * @returns {Promise<object|null>}
   */
  async findById(baggageId) {
    const { hex } = rawHelper.normalizeRaw32(baggageId);

    const sql = `
      SELECT 
        RAWTOHEX(B.BAGGAGE_ID) AS BAGGAGE_ID,
        RAWTOHEX(B.BAGGAGE_UT_HASH) AS BAGGAGE_UT_HASH
      FROM BAGGAGE B
      WHERE B.BAGGAGE_ID = HEXTORAW(:baggageId)
    `;

    const result = await db.execute(sql, { baggageId: hex });
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return this._mapLuggage(result.rows[0]);
  }

  /**
   * Busca detalhes completos de uma bagagem pelo BAGGAGE_ID através dos JOINs oficiais:
   * BAGGAGE JOIN USERS_TICKETS JOIN TICKETS JOIN TRIPS JOIN USERS
   * 
   * @param {string} baggageId - Hex RAW(32)
   * @returns {Promise<object|null>}
   */
  async findDetailsById(baggageId) {
    const { hex } = rawHelper.normalizeRaw32(baggageId);

    const sql = `
      SELECT 
        RAWTOHEX(B.BAGGAGE_ID) AS BAGGAGE_ID,
        RAWTOHEX(B.BAGGAGE_UT_HASH) AS BAGGAGE_UT_HASH,
        RAWTOHEX(UT.UT_TICKET) AS TICKET_ID,
        RAWTOHEX(UT.UT_USER) AS USER_ID,
        U.USER_NAME AS PASSENGER_NAME,
        TK.TICKET_SEAT,
        TR.TRIP_DEPARTURE,
        TR.TRIP_ARRIVAL,
        TR.TRIP_DATE
      FROM BAGGAGE B
      JOIN USERS_TICKETS UT ON UT.UT_HASH = B.BAGGAGE_UT_HASH
      JOIN TICKETS TK ON TK.TICKET_ID = UT.UT_TICKET
      JOIN TRIPS TR ON TR.TRIP_ID = TK.TICKET_TRIP
      JOIN USERS U ON U.USER_ID = UT.UT_USER
      WHERE B.BAGGAGE_ID = HEXTORAW(:baggageId)
    `;

    const result = await db.execute(sql, { baggageId: hex });
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return {
      baggageId: row.BAGGAGE_ID,
      baggageUtHash: row.BAGGAGE_UT_HASH,
      ticketId: row.TICKET_ID,
      userId: row.USER_ID,
      passengerName: row.PASSENGER_NAME,
      seat: Number(row.TICKET_SEAT),
      departure: row.TRIP_DEPARTURE,
      arrival: row.TRIP_ARRIVAL,
      tripDate: row.TRIP_DATE,
    };
  }

  /**
   * Insere uma nova bagagem associando ao UT_HASH oficial
   * @param {string} baggageId - RAW(32)
   * @param {string} utHash - RAW(32) de USERS_TICKETS.UT_HASH
   * @param {object} [connection] - Suporte a transação
   * @returns {Promise<object>}
   */
  async create(baggageId, utHash, connection = null) {
    const bagIdHex = rawHelper.normalizeRaw32(baggageId).hex;
    const utHashHex = rawHelper.normalizeRaw32(utHash).hex;

    const sql = `
      INSERT INTO BAGGAGE (
        BAGGAGE_ID,
        BAGGAGE_UT_HASH
      ) VALUES (
        HEXTORAW(:baggageId),
        HEXTORAW(:utHash)
      )
    `;

    const binds = { baggageId: bagIdHex, utHash: utHashHex };

    if (connection) {
      await connection.execute(sql, binds);
    } else {
      await db.execute(sql, binds, { autoCommit: true });
    }

    return {
      baggageId: bagIdHex,
      baggageUtHash: utHashHex,
    };
  }

  /**
   * Remove uma bagagem com segurança
   * @param {string} baggageId - Hex RAW(32)
   * @param {object} [connection]
   * @returns {Promise<number>} Linhas afetadas
   */
  async deleteById(baggageId, connection = null) {
    const { hex } = rawHelper.normalizeRaw32(baggageId);

    const sql = `
      DELETE FROM BAGGAGE
      WHERE BAGGAGE_ID = HEXTORAW(:baggageId)
    `;

    const binds = { baggageId: hex };

    let result;
    if (connection) {
      result = await connection.execute(sql, binds);
    } else {
      result = await db.execute(sql, binds, { autoCommit: true });
    }

    return result.rowsAffected || 0;
  }

  _mapLuggage(row) {
    return {
      baggageId: row.BAGGAGE_ID,
      baggageUtHash: row.BAGGAGE_UT_HASH,
    };
  }
}

module.exports = new LuggageRepository();