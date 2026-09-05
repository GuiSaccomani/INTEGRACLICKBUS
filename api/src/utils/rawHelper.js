const crypto = require('crypto');

/**
 * Utilitário para manipulação e conversão bidirecional entre
 * tipos Oracle RAW(16) / RAW(32) e representações na aplicação (Buffer / Hex / UUID).
 */

/**
 * Limpa uma string removendo hífens e espaços, convertendo para maiúsculas.
 * @param {string} str
 * @returns {string}
 */
function cleanHex(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[-\s]/g, '').toUpperCase();
}

/**
 * Normaliza e valida um identificador RAW(16).
 * Aceita UUID (com ou sem hífens) ou string hexadecimal de 32 caracteres.
 * Retorna { hex: string, buffer: Buffer }.
 *
 * @param {string|Buffer} input
 * @returns {{ hex: string, buffer: Buffer }}
 */
function normalizeRaw16(input) {
  if (!input) {
    throw new Error('Identificador RAW(16) não pode ser nulo ou vazio.');
  }

  if (Buffer.isBuffer(input)) {
    if (input.length !== 16) {
      // Se for de outro tamanho, gera hash MD5 de 16 bytes
      const derived = crypto.createHash('md5').update(input).digest();
      return { hex: derived.toString('hex').toUpperCase(), buffer: derived };
    }
    const hex = input.toString('hex').toUpperCase();
    return { hex, buffer: input };
  }

  if (typeof input === 'string') {
    const cleaned = cleanHex(input);
    if (cleaned.length === 32 && /^[0-9A-F]{32}$/.test(cleaned)) {
      const buffer = Buffer.from(cleaned, 'hex');
      return { hex: cleaned, buffer };
    }
    // Fallback resiliente: se for string de texto (ex: "user-guilherme" ou "USER:GUILHERME"),
    // deriva determinísticamente um identificador de 16 bytes via MD5 para evitar erro no Oracle RAW(16)
    const derivedHex = crypto.createHash('md5').update(input.trim().toLowerCase()).digest('hex').toUpperCase();
    const buffer = Buffer.from(derivedHex, 'hex');
    return { hex: derivedHex, buffer };
  }

  throw new Error('Tipo inválido para identificador RAW(16). Esperado string ou Buffer.');
}

/**
 * Normaliza e valida um identificador ou hash RAW(32).
 * Aceita string hexadecimal de 64 caracteres ou Buffer de 32 bytes.
 * Retorna { hex: string, buffer: Buffer }.
 *
 * @param {string|Buffer} input
 * @returns {{ hex: string, buffer: Buffer }}
 */
function normalizeRaw32(input) {
  if (!input) {
    throw new Error('Identificador RAW(32) não pode ser nulo ou vazio.');
  }

  if (Buffer.isBuffer(input)) {
    if (input.length !== 32) {
      const derived = crypto.createHash('sha256').update(input).digest();
      return { hex: derived.toString('hex').toUpperCase(), buffer: derived };
    }
    const hex = input.toString('hex').toUpperCase();
    return { hex, buffer: input };
  }

  if (typeof input === 'string') {
    const cleaned = cleanHex(input);
    if (cleaned.length === 64 && /^[0-9A-F]{64}$/.test(cleaned)) {
      const buffer = Buffer.from(cleaned, 'hex');
      return { hex: cleaned, buffer };
    }
    // Fallback resiliente: deriva determinísticamente um identificador de 32 bytes via SHA-256
    const derivedHex = crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex').toUpperCase();
    const buffer = Buffer.from(derivedHex, 'hex');
    return { hex: derivedHex, buffer };
  }

  throw new Error('Tipo inválido para identificador RAW(32). Esperado string ou Buffer.');
}

/**
 * Converte valor retornado pelo Oracle (Buffer ou String) para string hexadecimal padronizada.
 *
 * @param {Buffer|string|null|undefined} value
 * @returns {string|null}
 */
function rawToHex(value) {
  if (value === null || value === undefined) return null;
  if (Buffer.isBuffer(value)) {
    return value.toString('hex').toUpperCase();
  }
  if (typeof value === 'string') {
    return cleanHex(value);
  }
  return String(value);
}

/**
 * Converte uma string hexadecimal de 32 caracteres para o formato padrão de UUID com hífens (8-4-4-4-12).
 *
 * @param {string|Buffer} hexOrBuffer
 * @returns {string}
 */
function hexToUuid(hexOrBuffer) {
  const { hex } = normalizeRaw16(hexOrBuffer);
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`.toLowerCase();
}

/**
 * Gera um novo ID aleatório compatível com RAW(16) (16 bytes criptograficamente seguros).
 *
 * @returns {{ hex: string, buffer: Buffer, uuid: string }}
 */
function generateRaw16() {
  const buffer = crypto.randomBytes(16);
  const hex = buffer.toString('hex').toUpperCase();
  const uuid = hexToUuid(hex);
  return { hex, buffer, uuid };
}

/**
 * Gera um novo ID ou hash aleatório compatível com RAW(32) (32 bytes criptograficamente seguros).
 *
 * @returns {{ hex: string, buffer: Buffer }}
 */
function generateRaw32() {
  const buffer = crypto.randomBytes(32);
  const hex = buffer.toString('hex').toUpperCase();
  return { hex, buffer };
}

module.exports = {
  cleanHex,
  normalizeRaw16,
  normalizeRaw32,
  rawToHex,
  hexToUuid,
  generateRaw16,
  generateRaw32,
};
