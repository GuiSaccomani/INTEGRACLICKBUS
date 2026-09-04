const crypto = require('crypto');

/**
 * ChallengeStore - Gerenciador seguro de desafios WebAuthn em memória com TTL e proteção anti-replay.
 * 
 * Regras de Segurança:
 * 1. Cada desafio possui expiração rígida (padrão: 120 segundos).
 * 2. Uso estritamente único: o desafio é destruído imediatamente após a primeira tentativa de validação.
 * 3. NUNCA armazenado em localstorage, cookies ou exposto publicamente.
 */
class ChallengeStore {
  constructor(defaultTtlMs = 120000) {
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();

    // Limpeza periódica de desafios expirados a cada 30 segundos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Armazena um desafio associado a uma chave (ex: sessionKey, userId ou email)
   * @param {string} key 
   * @param {string} challenge 
   * @param {object} [metadata] 
   * @param {number} [ttlMs] 
   */
  set(key, challenge, metadata = {}, ttlMs = this.defaultTtlMs) {
    if (!key || !challenge) {
      throw new Error('Chave e challenge são obrigatórios para armazenamento.');
    }

    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, {
      challenge,
      metadata,
      expiresAt,
      createdAt: Date.now(),
    });

    return { key, expiresAt };
  }

  /**
   * Obtém o desafio sem consumi-lo (apenas se ainda válido)
   * @param {string} key 
   * @returns {object|null}
   */
  get(key) {
    if (!key || !this.store.has(key)) {
      return null;
    }

    const entry = this.store.get(key);
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Consome o desafio imediatamente (Garante USO ÚNICO e proteção contra Replay)
   * @param {string} key 
   * @returns {object|null}
   */
  consume(key) {
    if (!key || !this.store.has(key)) {
      return null;
    }

    const entry = this.store.get(key);
    // Remove imediatamente do store (uso único)
    this.store.delete(key);

    if (Date.now() > entry.expiresAt) {
      return null; // Expirado
    }

    return entry;
  }

  /**
   * Limpa desafios expirados
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Limpa todos os desafios (útil para testes unitários)
   */
  clear() {
    this.store.clear();
  }

  /**
   * Quantidade de desafios ativos
   */
  size() {
    return this.store.size;
  }
}

module.exports = new ChallengeStore();
