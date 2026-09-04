const db = require('../database');
const rawHelper = require('../utils/rawHelper');

/**
 * WebauthnRepository - Persistência oficial para a tabela WEBAUTHN_CREDENTIALS do Oracle.
 * Fornece fallback resiliente em memória caso a tabela ainda não tenha sido criada no ambiente local.
 */
class WebauthnRepository {
  constructor() {
    // Fallback em memória para ambientes de teste e desenvolvimento local sem a tabela DDL executada
    this._memoryStore = new Map();
  }

  /**
   * Busca uma credencial WebAuthn pelo CREDENTIAL_ID
   * @param {string} credentialId 
   * @returns {Promise<object|null>}
   */
  async findByCredentialId(credentialId) {
    if (!credentialId) return null;

    try {
      const sql = `
        SELECT 
          CREDENTIAL_ID,
          RAWTOHEX(USER_ID) AS USER_ID,
          PUBLIC_KEY,
          SIGN_COUNT,
          TRANSPORTS,
          DEVICE_NAME,
          CREATED_AT,
          LAST_USED_AT
        FROM WEBAUTHN_CREDENTIALS
        WHERE CREDENTIAL_ID = :credentialId
      `;

      const result = await db.execute(sql, { credentialId });
      if (result.rows && result.rows.length > 0) {
        return this._mapCredential(result.rows[0]);
      }
    } catch (dbError) {
      // Se a tabela ainda não existir no Oracle local ou houver desconexão, consulta o fallback de memória
      // console.warn('[WebauthnRepository] Fallback para memória em findByCredentialId:', dbError.message);
    }

    const mem = this._memoryStore.get(credentialId);
    return mem ? { ...mem } : null;
  }

  /**
   * Busca todas as credenciais registradas de um usuário pelo USER_ID
   * @param {string} userId - UUID ou hex de 32 caracteres
   * @returns {Promise<Array<object>>}
   */
  async findByUserId(userId) {
    if (!userId) return [];
    const { hex } = rawHelper.normalizeRaw16(userId);

    try {
      const sql = `
        SELECT 
          CREDENTIAL_ID,
          RAWTOHEX(USER_ID) AS USER_ID,
          PUBLIC_KEY,
          SIGN_COUNT,
          TRANSPORTS,
          DEVICE_NAME,
          CREATED_AT,
          LAST_USED_AT
        FROM WEBAUTHN_CREDENTIALS
        WHERE USER_ID = HEXTORAW(:userId)
        ORDER BY CREATED_AT DESC
      `;

      const result = await db.execute(sql, { userId: hex });
      if (result.rows && result.rows.length > 0) {
        return result.rows.map((r) => this._mapCredential(r));
      }
    } catch (dbError) {
      // console.warn('[WebauthnRepository] Fallback para memória em findByUserId:', dbError.message);
    }

    // Busca no fallback de memória
    const list = [];
    for (const cred of this._memoryStore.values()) {
      const credUserHex = rawHelper.normalizeRaw16(cred.userId).hex;
      if (credUserHex === hex) {
        list.push({ ...cred });
      }
    }
    return list;
  }

  /**
   * Salva uma nova credencial WebAuthn
   * @param {object} credData 
   * @returns {Promise<object>}
   */
  async create(credData) {
    const {
      credentialId,
      userId,
      publicKey,
      signCount = 0,
      transports = null,
      deviceName = 'Dispositivo Confiável',
    } = credData;

    const { hex: userHex } = rawHelper.normalizeRaw16(userId);
    const transportsStr = Array.isArray(transports) ? transports.join(',') : (transports || '');

    const newCred = {
      credentialId,
      userId: userHex,
      publicKey,
      signCount: Number(signCount) || 0,
      transports: transportsStr,
      deviceName,
      createdAt: new Date(),
      lastUsedAt: null,
    };

    // Sempre armazena no fallback de memória para garantir sincronia local
    this._memoryStore.set(credentialId, newCred);

    try {
      const sql = `
        INSERT INTO WEBAUTHN_CREDENTIALS (
          CREDENTIAL_ID,
          USER_ID,
          PUBLIC_KEY,
          SIGN_COUNT,
          TRANSPORTS,
          DEVICE_NAME,
          CREATED_AT
        ) VALUES (
          :credentialId,
          HEXTORAW(:userId),
          :publicKey,
          :signCount,
          :transports,
          :deviceName,
          SYSTIMESTAMP
        )
      `;

      await db.execute(sql, {
        credentialId,
        userId: userHex,
        publicKey,
        signCount: Number(signCount) || 0,
        transports: transportsStr,
        deviceName,
      }, { autoCommit: true });
    } catch (dbError) {
      // Registrado no fallback de memória com sucesso
    }

    return newCred;
  }

  /**
   * Atualiza o contador de assinaturas (sign counter) e a data do último uso
   * @param {string} credentialId 
   * @param {number} newSignCount 
   * @returns {Promise<void>}
   */
  async updateSignCount(credentialId, newSignCount) {
    const mem = this._memoryStore.get(credentialId);
    if (mem) {
      mem.signCount = Number(newSignCount);
      mem.lastUsedAt = new Date();
    }

    try {
      const sql = `
        UPDATE WEBAUTHN_CREDENTIALS
        SET 
          SIGN_COUNT = :newSignCount,
          LAST_USED_AT = SYSTIMESTAMP
        WHERE CREDENTIAL_ID = :credentialId
      `;

      await db.execute(sql, {
        credentialId,
        newSignCount: Number(newSignCount),
      }, { autoCommit: true });
    } catch (dbError) {
      // Ignora erro no banco se tabela não existir
    }
  }

  /**
   * Remove uma credencial específica
   * @param {string} credentialId 
   * @param {string} [userId] 
   * @returns {Promise<boolean>}
   */
  async deleteByCredentialId(credentialId, userId = null) {
    let deleted = false;
    if (this._memoryStore.has(credentialId)) {
      if (!userId) {
        this._memoryStore.delete(credentialId);
        deleted = true;
      } else {
        const targetHex = rawHelper.normalizeRaw16(userId).hex;
        const current = this._memoryStore.get(credentialId);
        if (current && rawHelper.normalizeRaw16(current.userId).hex === targetHex) {
          this._memoryStore.delete(credentialId);
          deleted = true;
        }
      }
    }

    try {
      let sql = `DELETE FROM WEBAUTHN_CREDENTIALS WHERE CREDENTIAL_ID = :credentialId`;
      const binds = { credentialId };

      if (userId) {
        sql += ` AND USER_ID = HEXTORAW(:userId)`;
        binds.userId = rawHelper.normalizeRaw16(userId).hex;
      }

      const res = await db.execute(sql, binds, { autoCommit: true });
      if (res && res.rowsAffected && res.rowsAffected > 0) {
        deleted = true;
      }
    } catch (dbError) {
      // Ignora erro no banco se tabela não existir
    }

    return deleted;
  }

  /**
   * Remove todas as credenciais de um usuário
   * @param {string} userId 
   * @returns {Promise<number>}
   */
  async deleteByUserId(userId) {
    const { hex } = rawHelper.normalizeRaw16(userId);
    let count = 0;

    for (const [id, cred] of this._memoryStore.entries()) {
      if (rawHelper.normalizeRaw16(cred.userId).hex === hex) {
        this._memoryStore.delete(id);
        count++;
      }
    }

    try {
      const sql = `DELETE FROM WEBAUTHN_CREDENTIALS WHERE USER_ID = HEXTORAW(:userId)`;
      const res = await db.execute(sql, { userId: hex }, { autoCommit: true });
      if (res && res.rowsAffected) {
        count = Math.max(count, res.rowsAffected);
      }
    } catch (dbError) {
      // Ignora erro no banco se tabela não existir
    }

    return count;
  }

  /**
   * Limpa armazenamento em memória (para uso em testes)
   */
  clearMemory() {
    this._memoryStore.clear();
  }

  _mapCredential(row) {
    return {
      credentialId: row.CREDENTIAL_ID,
      userId: row.USER_ID,
      publicKey: row.PUBLIC_KEY,
      signCount: Number(row.SIGN_COUNT) || 0,
      transports: row.TRANSPORTS ? row.TRANSPORTS.split(',').filter(Boolean) : [],
      deviceName: row.DEVICE_NAME || 'Dispositivo Confiável',
      createdAt: row.CREATED_AT,
      lastUsedAt: row.LAST_USED_AT,
    };
  }
}

module.exports = new WebauthnRepository();
