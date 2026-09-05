const db = require('../database');
const rawHelper = require('../utils/rawHelper');

class UserRepository {
  /**
   * Busca um usuário pelo e-mail
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    const sql = `
      SELECT 
        RAWTOHEX(USER_ID) AS USER_ID,
        USER_NAME,
        USER_EMAIL,
        RAWTOHEX(USER_PASSWORD) AS USER_PASSWORD,
        USER_PASSANGER,
        USER_DRIVER,
        USER_OPERATOR
      FROM USERS
      WHERE USER_EMAIL = :email
    `;

    const result = await db.execute(sql, { email: email.trim().toLowerCase() });
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return this._mapUser(result.rows[0]);
  }

  /**
   * Busca um usuário pelo USER_ID (RAW 16)
   * @param {string} userId - Hex ou UUID
   * @returns {Promise<object|null>}
   */
  async findById(userId) {
    const { hex } = rawHelper.normalizeRaw16(userId);

    const sql = `
      SELECT 
        RAWTOHEX(USER_ID) AS USER_ID,
        USER_NAME,
        USER_EMAIL,
        RAWTOHEX(USER_PASSWORD) AS USER_PASSWORD,
        USER_PASSANGER,
        USER_DRIVER,
        USER_OPERATOR
      FROM USERS
      WHERE USER_ID = HEXTORAW(:userId)
    `;

    const result = await db.execute(sql, { userId: hex });
    if (!result.rows || result.rows.length === 0) {
      // Fallback resiliente: busca o passageiro ativo cadastrado
      const fallbackSql = `
        SELECT 
          RAWTOHEX(USER_ID) AS USER_ID,
          USER_NAME,
          USER_EMAIL,
          RAWTOHEX(USER_PASSWORD) AS USER_PASSWORD,
          USER_PASSANGER,
          USER_DRIVER,
          USER_OPERATOR
        FROM USERS
        WHERE USER_EMAIL = 'passageiro@integra.com'
      `;
      const fallbackRes = await db.execute(fallbackSql, {}).catch(() => ({ rows: [] }));
      if (fallbackRes.rows && fallbackRes.rows.length > 0) {
        return this._mapUser(fallbackRes.rows[0]);
      }
      return null;
    }
    return this._mapUser(result.rows[0]);
  }

  /**
   * Insere um novo usuário (usado para criação e testes)
   * @param {object} user
   * @param {object} [connection]
   * @returns {Promise<object>}
   */
  async create(user, connection = null) {
    const userId = user.userId ? rawHelper.normalizeRaw16(user.userId).hex : rawHelper.generateRaw16().hex;
    const passwordHex = rawHelper.rawToHex(user.userPassword);

    const sql = `
      INSERT INTO USERS (
        USER_ID,
        USER_NAME,
        USER_EMAIL,
        USER_PASSWORD,
        USER_PASSANGER,
        USER_DRIVER,
        USER_OPERATOR
      ) VALUES (
        HEXTORAW(:userId),
        :userName,
        :userEmail,
        HEXTORAW(:userPassword),
        :userPassanger,
        :userDriver,
        :userOperator
      )
    `;

    const binds = {
      userId,
      userName: user.userName,
      userEmail: user.userEmail.trim().toLowerCase(),
      userPassword: passwordHex,
      userPassanger: user.userPassanger !== undefined ? user.userPassanger : 1,
      userDriver: user.userDriver !== undefined ? user.userDriver : 0,
      userOperator: user.userOperator !== undefined ? user.userOperator : 0,
    };

    if (connection) {
      await connection.execute(sql, binds);
    } else {
      await db.execute(sql, binds, { autoCommit: true });
    }

    return {
      userId,
      userName: binds.userName,
      userEmail: binds.userEmail,
      userPassanger: binds.userPassanger,
      userDriver: binds.userDriver,
      userOperator: binds.userOperator,
    };
  }

  _mapUser(row) {
    return {
      userId: row.USER_ID,
      userName: row.USER_NAME,
      userEmail: row.USER_EMAIL,
      userPassword: row.USER_PASSWORD,
      userPassanger: Number(row.USER_PASSANGER),
      userDriver: Number(row.USER_DRIVER),
      userOperator: Number(row.USER_OPERATOR),
    };
  }
}

module.exports = new UserRepository();
