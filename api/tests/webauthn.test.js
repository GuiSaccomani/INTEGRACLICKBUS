const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const challengeStore = require('../src/services/challengeStore');
const webauthnService = require('../src/services/webauthnService');
const webauthnRepository = require('../src/repositories/webauthnRepository');
const userRepository = require('../src/repositories/userRepository');

describe('WebAuthn / Passkeys - Segurança, Challenges e Anti-Replay', () => {
  beforeEach(() => {
    challengeStore.clear();
    webauthnRepository.clearMemory();
  });

  it('deve armazenar desafio com expiração e recuperar com sucesso antes do TTL', () => {
    challengeStore.set('test-user-1', 'desafio_cripto_123', { type: 'registration' }, 5000);
    const entry = challengeStore.get('test-user-1');

    assert.ok(entry);
    assert.equal(entry.challenge, 'desafio_cripto_123');
    assert.equal(entry.metadata.type, 'registration');
    assert.ok(entry.expiresAt > Date.now());
  });

  it('deve invalidar desafio imediatamente após consumo (Uso Único Anti-Replay)', () => {
    challengeStore.set('test-user-replay', 'desafio_unico_456', {}, 5000);

    // Primeiro consumo: válido
    const firstConsume = challengeStore.consume('test-user-replay');
    assert.ok(firstConsume);
    assert.equal(firstConsume.challenge, 'desafio_unico_456');

    // Segundo consumo com o mesmo desafio: DEVE RETORNAR NULL (Bloqueio de Replay)
    const secondConsume = challengeStore.consume('test-user-replay');
    assert.equal(secondConsume, null, 'O desafio consumido não pode ser reutilizado');
  });

  it('deve rejeitar desafio expirado (TTL esgotado)', () => {
    // TTL negativo para simular expiração imediata
    challengeStore.set('test-user-expired', 'desafio_expirado', {}, -100);

    const entry = challengeStore.get('test-user-expired');
    assert.equal(entry, null, 'Desafio expirado não pode ser recuperado');

    const consumed = challengeStore.consume('test-user-expired');
    assert.equal(consumed, null, 'Desafio expirado não pode ser consumido');
  });
});

describe('WebAuthnService - Fluxo de Registro de Biometria', () => {
  const mockUser = {
    userId: 'B1EEBC999C0B4EF8BB6D6BB9BD380A22',
    userName: 'Guilherme Passageiro',
    userEmail: 'guilherme@integra.com',
    userPassword: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF',
    userPassanger: 1,
    userDriver: 0,
    userOperator: 0,
  };

  beforeEach(() => {
    challengeStore.clear();
    webauthnRepository.clearMemory();
  });

  it('deve gerar Registration Options válidas para usuário autenticado', async () => {
    const origFindById = userRepository.findById;
    userRepository.findById = async () => mockUser;

    try {
      const mockReq = {
        hostname: 'localhost',
        get: (h) => (h === 'host' ? 'localhost:3333' : null),
      };

      const options = await webauthnService.generateRegistrationOptions(mockUser.userId, mockReq);

      assert.ok(options.challenge, 'Deve gerar challenge criptográfico');
      assert.equal(options.rp.name, 'ÍNTEGRA - Plataforma de Embarque Digital');
      assert.equal(options.user.name, mockUser.userEmail);
      assert.equal(options.authenticatorSelection.authenticatorAttachment, 'platform');

      // Verifica se o challenge foi armazenado no ChallengeStore vinculado ao usuário
      const savedChallenge = challengeStore.get(`reg:${mockUser.userId}`);
      assert.ok(savedChallenge);
      assert.equal(savedChallenge.challenge, options.challenge);
    } finally {
      userRepository.findById = origFindById;
    }
  });

  it('deve rejeitar geração de Registration Options se o usuário não estiver autenticado (401)', async () => {
    await assert.rejects(
      async () => {
        await webauthnService.generateRegistrationOptions(null);
      },
      (err) => {
        assert.equal(err.status, 401);
        assert.match(err.message, /autenticado/);
        return true;
      }
    );
  });

  it('deve rejeitar geração de Registration Options se o usuário não existir no banco (404)', async () => {
    const origFindById = userRepository.findById;
    userRepository.findById = async () => null;

    try {
      await assert.rejects(
        async () => {
          await webauthnService.generateRegistrationOptions('inexistente');
        },
        (err) => {
          assert.equal(err.status, 404);
          assert.match(err.message, /não foi encontrado/);
          return true;
        }
      );
    } finally {
      userRepository.findById = origFindById;
    }
  });

  it('deve rejeitar verifyRegistration se o desafio não existir ou estiver expirado (400)', async () => {
    const mockReq = {
      hostname: 'localhost',
      get: () => 'http://localhost:5173',
    };

    await assert.rejects(
      async () => {
        await webauthnService.verifyRegistration('user-sem-desafio', { id: 'cred123' }, mockReq);
      },
      (err) => {
        assert.equal(err.status, 400);
        assert.match(err.message, /expirado ou não encontrado/);
        return true;
      }
    );
  });

  it('deve rejeitar verifyRegistration e bloquear reutilização do desafio (anti-replay)', async () => {
    const userId = 'user-replay-test';
    challengeStore.set(`reg:${userId}`, 'challenge-12345');

    const mockReq = {
      hostname: 'localhost',
      get: () => 'http://localhost:5173',
    };

    // Primeira tentativa falha por dados inválidos de autenticador
    await assert.rejects(
      async () => {
        await webauthnService.verifyRegistration(userId, { id: 'invalid-resp' }, mockReq);
      }
    );

    // O challenge DEVE ter sido consumido e agora DEVE ser rejeitado como não encontrado
    await assert.rejects(
      async () => {
        await webauthnService.verifyRegistration(userId, { id: 'invalid-resp' }, mockReq);
      },
      (err) => {
        assert.equal(err.status, 400);
        assert.match(err.message, /expirado ou não encontrado/);
        return true;
      }
    );
  });
});

describe('WebAuthnService - Fluxo de Autenticação / Login com Biometria', () => {
  const mockUser = {
    userId: 'C2EEBC999C0B4EF8BB6D6BB9BD380A33',
    userName: 'Carlos Motorista',
    userEmail: 'motorista@integra.com',
    userPassanger: 0,
    userDriver: 1,
    userOperator: 0,
  };

  beforeEach(() => {
    challengeStore.clear();
    webauthnRepository.clearMemory();
  });

  it('deve gerar Login Options válidas com challenge novo', async () => {
    const origFindByEmail = userRepository.findByEmail;
    userRepository.findByEmail = async () => mockUser;

    try {
      const mockReq = {
        hostname: 'localhost',
        get: () => 'http://localhost:5173',
      };

      const { options, challengeKey } = await webauthnService.generateLoginOptions('motorista@integra.com', mockReq);

      assert.ok(options.challenge);
      assert.equal(challengeKey, options.challenge);

      // Challenge deve estar no ChallengeStore com TTL
      const saved = challengeStore.get(`auth:${challengeKey}`);
      assert.ok(saved);
      assert.equal(saved.challenge, options.challenge);
    } finally {
      userRepository.findByEmail = origFindByEmail;
    }
  });

  it('deve rejeitar login se a credencial biométrica não estiver cadastrada no sistema (404)', async () => {
    const challengeKey = 'auth-chal-999';
    challengeStore.set(`auth:${challengeKey}`, challengeKey);

    const mockReq = {
      hostname: 'localhost',
      get: () => 'http://localhost:5173',
    };

    const mockResponse = {
      id: 'credencial_desconhecida_xyz',
      response: {},
    };

    await assert.rejects(
      async () => {
        await webauthnService.verifyLogin(mockResponse, challengeKey, mockReq);
      },
      (err) => {
        assert.equal(err.status, 404);
        assert.match(err.message, /não reconhecida/);
        return true;
      }
    );
  });

  it('deve rejeitar login se o desafio expirou ou for reutilizado (anti-replay)', async () => {
    const challengeKey = 'auth-chal-replay';
    // Não insere no challengeStore (ou simula expirado)
    const mockReq = {
      hostname: 'localhost',
      get: () => 'http://localhost:5173',
    };

    const mockResponse = {
      id: 'credencial_valida',
      response: {},
    };

    await assert.rejects(
      async () => {
        await webauthnService.verifyLogin(mockResponse, challengeKey, mockReq);
      },
      (err) => {
        assert.equal(err.status, 400);
        assert.match(err.message, /expirado ou inválido/);
        return true;
      }
    );
  });
});

describe('WebAuthnRepository - Gestão de Múltiplos Dispositivos e Remoção', () => {
  const userId = 'D3EEBC999C0B4EF8BB6D6BB9BD380A44';

  beforeEach(() => {
    webauthnRepository.clearMemory();
  });

  it('deve permitir cadastrar múltiplos dispositivos para o mesmo usuário (1:N)', async () => {
    await webauthnRepository.create({
      credentialId: 'cred_iphone_15',
      userId,
      publicKey: 'pub_key_base64_iphone',
      signCount: 0,
      deviceName: 'iPhone 15 Pro',
    });

    await webauthnRepository.create({
      credentialId: 'cred_notebook_dell',
      userId,
      publicKey: 'pub_key_base64_dell',
      signCount: 0,
      deviceName: 'Notebook Dell (Windows Hello)',
    });

    const list = await webauthnRepository.findByUserId(userId);
    assert.equal(list.length, 2, 'Usuário deve possuir 2 credenciais de dispositivos distintos');

    const devNames = list.map((c) => c.deviceName);
    assert.ok(devNames.includes('iPhone 15 Pro'));
    assert.ok(devNames.includes('Notebook Dell (Windows Hello)'));
  });

  it('deve atualizar signCount com sucesso ao autenticar', async () => {
    await webauthnRepository.create({
      credentialId: 'cred_counter_test',
      userId,
      publicKey: 'pub_key_test',
      signCount: 1,
    });

    await webauthnRepository.updateSignCount('cred_counter_test', 5);

    const cred = await webauthnRepository.findByCredentialId('cred_counter_test');
    assert.equal(cred.signCount, 5);
    assert.ok(cred.lastUsedAt);
  });

  it('deve remover credencial específica do dispositivo sem afetar outros dispositivos', async () => {
    await webauthnRepository.create({
      credentialId: 'cred_device_a',
      userId,
      publicKey: 'pub_key_a',
      deviceName: 'Dispositivo A',
    });

    await webauthnRepository.create({
      credentialId: 'cred_device_b',
      userId,
      publicKey: 'pub_key_b',
      deviceName: 'Dispositivo B',
    });

    // Remove apenas o dispositivo A
    const removed = await webauthnRepository.deleteByCredentialId('cred_device_a', userId);
    assert.equal(removed, true);

    const remaining = await webauthnRepository.findByUserId(userId);
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].credentialId, 'cred_device_b');
  });

  it('deve impedir remoção se a credencial pertencer a outro usuário', async () => {
    await webauthnRepository.create({
      credentialId: 'cred_usuario_1',
      userId: '11111111111111111111111111111111',
      publicKey: 'pub_1',
    });

    // Tentativa de remoção por usuário diferente
    const removed = await webauthnRepository.deleteByCredentialId(
      'cred_usuario_1',
      '22222222222222222222222222222222'
    );
    assert.equal(removed, false);

    const stillExists = await webauthnRepository.findByCredentialId('cred_usuario_1');
    assert.ok(stillExists, 'Credencial não deve ter sido removida por usuário não autorizado');
  });
});
