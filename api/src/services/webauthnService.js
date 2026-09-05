const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const challengeStore = require('./challengeStore');
const webauthnRepository = require('../repositories/webauthnRepository');
const userRepository = require('../repositories/userRepository');
const rawHelper = require('../utils/rawHelper');

class WebauthnService {
  /**
   * Obtém o RP ID seguro considerando variáveis de ambiente e fallback local
   * @param {object} req 
   * @returns {string}
   */
  getRpId(req) {
    // 1. Extrai dinamicamente o domínio do frontend chamador (ex: integra-app-clickbus.netlify.app)
    if (req) {
      const origin = req.get('origin') || req.get('referer');
      if (origin) {
        try {
          const parsed = new URL(origin);
          return parsed.hostname;
        } catch (_) {}
      }
    }
    if (process.env.WEBAUTHN_RP_ID) {
      return process.env.WEBAUTHN_RP_ID;
    }
    if (req && req.hostname) {
      return req.hostname;
    }
    return 'localhost';
  }

  /**
   * Obtém a lista de origens esperadas válidas para WebAuthn
   * @param {object} req 
   * @returns {string|Array<string>}
   */
  getExpectedOrigins(req) {
    const configuredOrigin = process.env.WEBAUTHN_ORIGIN;
    const origins = new Set();

    if (configuredOrigin) {
      origins.add(configuredOrigin);
    }

    // Origens oficiais em produção e desenvolvimento
    origins.add('https://integra-app-clickbus.netlify.app');
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
    origins.add('http://localhost:3333');

    if (req) {
      const originHeader = req.get('origin');
      if (originHeader) origins.add(originHeader);
      const referer = req.get('referer');
      if (referer) {
        try {
          const parsed = new URL(referer);
          origins.add(parsed.origin);
        } catch (_) {}
      }
      const host = req.get('host');
      if (host) {
        origins.add(`http://${host}`);
        origins.add(`https://${host}`);
      }
    }

    return Array.from(origins);
  }

  getRpName() {
    return process.env.WEBAUTHN_RP_NAME || 'ÍNTEGRA - Plataforma de Embarque Digital';
  }

  /**
   * 1. Gera opções de registro para um usuário autenticado
   * @param {string} userId 
   * @param {object} req 
   * @returns {Promise<object>}
   */
  async generateRegistrationOptions(userId, req) {
    if (!userId) {
      const err = new Error('Usuário deve estar autenticado para registrar biometria.');
      err.status = 401;
      throw err;
    }

    // Busca o usuário no Oracle
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('Usuário autenticado não foi encontrado no sistema.');
      err.status = 404;
      throw err;
    }

    // Busca credenciais existentes para excluir duplicatas
    const existingCreds = await webauthnRepository.findByUserId(userId);
    const excludeCredentials = existingCreds.map((c) => ({
      id: c.credentialId,
      type: 'public-key',
      transports: c.transports || undefined,
    }));

    const rpID = this.getRpId(req);
    const rpName = this.getRpName();

    // Normaliza ID do usuário em buffer de 16 bytes
    const userBuffer = rawHelper.normalizeRaw16(user.userId).buffer;

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userBuffer,
      userName: user.userEmail,
      userDisplayName: user.userName || 'Usuário ÍNTEGRA',
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Plataforma do dispositivo (Touch ID, Face ID, Windows Hello)
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
    });

    // Salva o desafio no ChallengeStore com TTL de 2 minutos vinculado ao userId
    challengeStore.set(`reg:${user.userId}`, options.challenge, {
      userId: user.userId,
      userEmail: user.userEmail,
      type: 'registration',
    });

    return options;
  }

  /**
   * 2. Verifica a resposta de registro e armazena a credencial
   * @param {string} userId 
   * @param {object} responseBody 
   * @param {object} req 
   * @returns {Promise<object>}
   */
  async verifyRegistration(userId, responseBody, req) {
    if (!userId) {
      const err = new Error('Usuário não autenticado.');
      err.status = 401;
      throw err;
    }

    // Consome o challenge com proteção anti-replay
    const challengeEntry = challengeStore.consume(`reg:${userId}`);
    if (!challengeEntry) {
      const err = new Error('Desafio WebAuthn expirado ou não encontrado. Tente novamente.');
      err.status = 400;
      throw err;
    }

    const expectedRPID = this.getRpId(req);
    const expectedOrigins = this.getExpectedOrigins(req);

    // Se o cliente enviou origin no header, verifica
    const clientOrigin = req.get('origin') || expectedOrigins[0];

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: responseBody,
        expectedChallenge: challengeEntry.challenge,
        expectedOrigin: expectedOrigins,
        expectedRPID,
        requireUserVerification: false,
      });
    } catch (verifErr) {
      const err = new Error(`Falha na validação criptográfica do autenticador: ${verifErr.message}`);
      err.status = 400;
      throw err;
    }

    if (!verification.verified || !verification.registrationInfo) {
      const err = new Error('A validação da credencial biométrica falhou.');
      err.status = 400;
      throw err;
    }

    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

    // Converte a chave pública e credentialID para Base64URL string para persistência
    const credentialIdStr = Buffer.isBuffer(credentialID)
      ? credentialID.toString('base64url')
      : typeof credentialID === 'string'
      ? credentialID
      : Buffer.from(credentialID).toString('base64url');

    const publicKeyStr = Buffer.isBuffer(credentialPublicKey)
      ? credentialPublicKey.toString('base64url')
      : Buffer.from(credentialPublicKey).toString('base64url');

    // Transports enviados pelo cliente
    const transports = responseBody.response && responseBody.response.transports
      ? responseBody.response.transports
      : ['internal'];

    // Nome amigável do dispositivo
    const userAgent = req.get('user-agent') || '';
    let deviceName = 'Dispositivo Confiável';
    if (/iPhone|iPad/i.test(userAgent)) deviceName = 'Apple iOS (Touch ID / Face ID)';
    else if (/Android/i.test(userAgent)) deviceName = 'Dispositivo Android (Biometria)';
    else if (/Windows/i.test(userAgent)) deviceName = 'Windows (Windows Hello)';
    else if (/Mac/i.test(userAgent)) deviceName = 'Mac (Touch ID)';

    // Persiste a credencial no repositório Oracle
    const saved = await webauthnRepository.create({
      credentialId: credentialIdStr,
      userId,
      publicKey: publicKeyStr,
      signCount: counter || 0,
      transports,
      deviceName,
    });

    return {
      verified: true,
      message: 'Biometria registrada e associada com sucesso ao seu perfil.',
      credential: {
        credentialId: saved.credentialId,
        deviceName: saved.deviceName,
        createdAt: saved.createdAt,
      },
    };
  }

  /**
   * 3. Gera opções de autenticação (login)
   * @param {string} [email] 
   * @param {object} req 
   * @returns {Promise<object>}
   */
  async generateLoginOptions(email, req) {
    let allowCredentials = undefined;
    let targetUserId = null;

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const user = await userRepository.findByEmail(cleanEmail);
      if (user) {
        targetUserId = user.userId;
        const userCreds = await webauthnRepository.findByUserId(user.userId);
        if (userCreds && userCreds.length > 0) {
          allowCredentials = userCreds.map((c) => ({
            id: c.credentialId,
            type: 'public-key',
            transports: c.transports || undefined,
          }));
        }
      }
    }

    const rpID = this.getRpId(req);

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: 'preferred',
    });

    // Armazena o challenge pelo próprio valor do challenge com TTL de 2 minutos
    challengeStore.set(`auth:${options.challenge}`, options.challenge, {
      userId: targetUserId,
      email: email || null,
      type: 'authentication',
    });

    return {
      options,
      challengeKey: options.challenge,
    };
  }

  /**
   * 4. Verifica a resposta de autenticação biométrica e autentica o usuário
   * @param {object} responseBody 
   * @param {string} [challengeKey] 
   * @param {object} req 
   * @returns {Promise<object>}
   */
  async verifyLogin(responseBody, challengeKey, req) {
    if (!responseBody || !responseBody.id) {
      const err = new Error('Credencial biométrica ausente na requisição.');
      err.status = 400;
      throw err;
    }

    // Tenta obter o challenge do clientDataJSON se challengeKey não foi passado
    let key = challengeKey ? `auth:${challengeKey}` : null;

    if (!key && responseBody.response && responseBody.response.clientDataJSON) {
      try {
        const clientDataStr = Buffer.from(responseBody.response.clientDataJSON, 'base64url').toString('utf8');
        const clientData = JSON.parse(clientDataStr);
        if (clientData.challenge) {
          key = `auth:${clientData.challenge}`;
        }
      } catch {
        // ignora erro de parse
      }
    }

    if (!key) {
      const err = new Error('Chave de desafio não identificada.');
      err.status = 400;
      throw err;
    }

    // Consome o challenge com proteção anti-replay
    const challengeEntry = challengeStore.consume(key);
    if (!challengeEntry) {
      const err = new Error('Desafio de biometria expirado ou inválido. Tente novamente.');
      err.status = 400;
      throw err;
    }

    // Localiza a credencial persistida pelo credentialId
    const credentialId = responseBody.id;
    const cred = await webauthnRepository.findByCredentialId(credentialId);

    if (!cred) {
      const err = new Error('Credencial biométrica não reconhecida neste sistema.');
      err.status = 404;
      throw err;
    }

    // Localiza o usuário correspondente
    const user = await userRepository.findById(cred.userId);
    if (!user) {
      const err = new Error('Usuário associado a esta biometria não foi encontrado.');
      err.status = 404;
      throw err;
    }

    const expectedRPID = this.getRpId(req);
    const expectedOrigins = this.getExpectedOrigins(req);

    // Converte a chave pública de Base64URL string de volta para Uint8Array
    const publicKeyBuffer = Buffer.from(cred.publicKey, 'base64url');

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: responseBody,
        expectedChallenge: challengeEntry.challenge,
        expectedOrigin: expectedOrigins,
        expectedRPID,
        authenticator: {
          credentialID: Buffer.from(cred.credentialId, 'base64url'),
          credentialPublicKey: publicKeyBuffer,
          counter: cred.signCount || 0,
          transports: cred.transports,
        },
        requireUserVerification: false,
      });
    } catch (verifErr) {
      const err = new Error(`Falha ao validar assinatura biométrica: ${verifErr.message}`);
      err.status = 400;
      throw err;
    }

    if (!verification.verified) {
      const err = new Error('Autenticação biométrica não pôde ser confirmada.');
      err.status = 400;
      throw err;
    }

    // Atualiza contador de assinaturas (detecção de replay e clonagem)
    const newCounter = verification.authenticationInfo ? verification.authenticationInfo.newCounter : (cred.signCount + 1);
    await webauthnRepository.updateSignCount(cred.credentialId, newCounter);

    // Cria a sessão com as roles oficiais do usuário
    const roles = {
      isPassenger: user.userPassanger === 1,
      isDriver: user.userDriver === 1,
      isOperator: user.userOperator === 1,
    };

    return {
      verified: true,
      message: 'Autenticação biométrica realizada com sucesso.',
      user: {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        roles,
      },
    };
  }

  /**
   * 5. Obtém status e lista de credenciais biométricas de um usuário
   * @param {string} userId 
   */
  async getStatus(userId) {
    if (!userId) {
      return { registered: false, credentialsCount: 0, credentials: [] };
    }

    const creds = await webauthnRepository.findByUserId(userId);
    return {
      registered: creds.length > 0,
      credentialsCount: creds.length,
      credentials: creds.map((c) => ({
        credentialId: c.credentialId,
        deviceName: c.deviceName,
        createdAt: c.createdAt,
        lastUsedAt: c.lastUsedAt,
      })),
    };
  }

  /**
   * 6. Remove uma credencial biométrica específica do usuário
   * @param {string} credentialId 
   * @param {string} userId 
   */
  async removeCredential(credentialId, userId) {
    if (!credentialId) {
      const err = new Error('ID da credencial é obrigatório.');
      err.status = 400;
      throw err;
    }

    const success = await webauthnRepository.deleteByCredentialId(credentialId, userId);
    return {
      success,
      message: success
        ? 'Credencial biométrica removida com sucesso deste dispositivo.'
        : 'Credencial não encontrada ou já removida.',
    };
  }
}

module.exports = new WebauthnService();
