const crypto = require('crypto');
const rawHelper = require('./rawHelper');


const SUPPORTED_ALGORITHMS = {
  SHA256: (plain) => crypto.createHash('sha256').update(plain).digest(),
};

/**
 * Compara a senha informada em texto plano com o RAW(32) armazenado no banco Oracle.
 * 
 * @param {string} plainPassword - Senha enviada pelo usuário
 * @param {Buffer|string} storedRawPassword - Valor do campo USERS.USER_PASSWORD vindo do Oracle
 * @returns {boolean} Retorna true se a senha corresponder, false caso contrário.
 */
function verifyPassword(plainPassword, storedRawPassword) {
  if (!plainPassword || !storedRawPassword) {
    return false;
  }

  try {
    const { buffer: storedBuffer } = rawHelper.normalizeRaw32(storedRawPassword);

    // Estratégia configurável por variável de ambiente, padrão SHA256 para digest de 32 bytes
    const algorithmName = (process.env.PASSWORD_HASH_ALGORITHM || 'SHA256').toUpperCase();
    const hashFn = SUPPORTED_ALGORITHMS[algorithmName] || SUPPORTED_ALGORITHMS.SHA256;

    const computedBuffer = hashFn(plainPassword);

    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }

    // Comparação em tempo constante para prevenir ataques de timing
    return crypto.timingSafeEqual(computedBuffer, storedBuffer);
  } catch (error) {
    console.error('⚠️ [PasswordVerifier] Erro ao comparar senha:', error.message);
    return false;
  }
}

/**
 * Helper para gerar hash de 32 bytes compatível com a estratégia configurada (útil para testes de integração)
 * 
 * @param {string} plainPassword 
 * @returns {Buffer}
 */
function hashPassword(plainPassword) {
  const algorithmName = (process.env.PASSWORD_HASH_ALGORITHM || 'SHA256').toUpperCase();
  const hashFn = SUPPORTED_ALGORITHMS[algorithmName] || SUPPORTED_ALGORITHMS.SHA256;
  return hashFn(plainPassword);
}

module.exports = {
  verifyPassword,
  hashPassword,
};
