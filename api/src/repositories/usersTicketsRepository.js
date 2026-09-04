const db = require('../database');
const rawHelper = require('../utils/rawHelper');

class UsersTicketsRepository {
  /**
   * Busca a associação do usuário com o bilhete pelo TICKET_ID
   * @param {string} ticketId - Hex ou UUID
   * @returns {Promise<object|null>}
   */
  async findByTicketId(ticketId) {
    const { hex } = rawHelper.normalizeRaw16(ticketId);

    const sql = `
      SELECT 
        RAWTOHEX(UT.UT_ID) AS UT_ID,
        RAWTOHEX(UT.UT_USER) AS UT_USER,
        RAWTOHEX(UT.UT_TICKET) AS UT_TICKET,
        RAWTOHEX(UT.UT_HASH) AS UT_HASH,
        U.USER_NAME,
        U.USER_EMAIL
      FROM USERS_TICKETS UT
      JOIN USERS U ON U.USER_ID = UT.UT_USER
      WHERE UT.UT_TICKET = HEXTORAW(:ticketId)
    `;

    const result = await db.execute(sql, { ticketId: hex });
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return this._mapRow(result.rows[0]);
  }

  /**
   * Busca a associação pelo UT_HASH RAW(32)
   * @param {string} utHash - Hex de 64 caracteres
   * @returns {Promise<object|null>}
   */
  async findByHash(utHash) {
    const { hex } = rawHelper.normalizeRaw32(utHash);

    const sql = `
      SELECT 
        RAWTOHEX(UT.UT_ID) AS UT_ID,
        RAWTOHEX(UT.UT_USER) AS UT_USER,
        RAWTOHEX(UT.UT_TICKET) AS UT_TICKET,
        RAWTOHEX(UT.UT_HASH) AS UT_HASH,
        U.USER_NAME,
        U.USER_EMAIL
      FROM USERS_TICKETS UT
      JOIN USERS U ON U.USER_ID = UT.UT_USER
      WHERE UT.UT_HASH = HEXTORAW(:utHash)
    `;

    const result = await db.execute(sql, { utHash: hex });
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return this._mapRow(result.rows[0]);
  }

  /**
   * Cria associação entre usuário e bilhete gerando o UT_HASH oficial
   * @param {object} association
   * @param {object} [connection]
   * @returns {Promise<object>}
   */
  async create(association, connection = null) {
    const utId = association.utId ? rawHelper.normalizeRaw16(association.utId).hex : rawHelper.generateRaw16().hex;
    const utUser = rawHelper.normalizeRaw16(association.utUser).hex;
    const utTicket = rawHelper.normalizeRaw16(association.utTicket).hex;
    const utHash = association.utHash ? rawHelper.normalizeRaw32(association.utHash).hex : rawHelper.generateRaw32().hex;

    const sql = `
      INSERT INTO USERS_TICKETS (
        UT_ID,
        UT_USER,
        UT_TICKET,
        UT_HASH
      ) VALUES (
        HEXTORAW(:utId),
        HEXTORAW(:utUser),
        HEXTORAW(:utTicket),
        HEXTORAW(:utHash)
      )
    `;

    const binds = { utId, utUser, utTicket, utHash };

    if (connection) {
      await connection.execute(sql, binds);
    } else {
      await db.execute(sql, binds, { autoCommit: true });
    }

    return {
      utId,
      utUser,
      utTicket,
      utHash,
    };
  }

  _mapRow(row) {
    return {
      utId: row.UT_ID,
      utUser: row.UT_USER,
      utTicket: row.UT_TICKET,
      utHash: row.UT_HASH,
      userName: row.USER_NAME || null,
      userEmail: row.USER_EMAIL || null,
    };
  }
}

module.exports = new UsersTicketsRepository();
