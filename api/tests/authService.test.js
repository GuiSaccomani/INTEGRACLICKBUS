const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const authService = require('../src/services/authService');
const userRepository = require('../src/repositories/userRepository');
const { hashPassword } = require('../src/utils/passwordVerifier');

describe('AuthService - Autenticação e Papéis de Usuário', () => {
  it('deve realizar login com sucesso e mapear papéis corretamente a partir de USER_PASSANGER, USER_DRIVER e USER_OPERATOR', async () => {
    const originalFindByEmail = userRepository.findByEmail;

    const mockUser = {
      userId: 'A0EEBC999C0B4EF8BB6D6BB9BD380A11',
      userName: 'Carlos Motorista',
      userEmail: 'carlos@integra.com',
      userPassword: hashPassword('senhaForte123').toString('hex'),
      userPassanger: 0,
      userDriver: 1,
      userOperator: 0,
    };

    userRepository.findByEmail = async () => mockUser;

    try {
      const result = await authService.login('carlos@integra.com', 'senhaForte123');
      assert.ok(result.user);
      assert.equal(result.user.userName, 'Carlos Motorista');
      assert.equal(result.user.roles.isDriver, true);
      assert.equal(result.user.roles.isPassenger, false);
      assert.equal(result.user.roles.isOperator, false);
      // Garante que a senha NUNCA seja devolvida na resposta
      assert.equal(result.user.userPassword, undefined);
    } finally {
      userRepository.findByEmail = originalFindByEmail;
    }
  });

  it('deve rejeitar login com erro 401 se usuário não existir', async () => {
    const originalFindByEmail = userRepository.findByEmail;
    userRepository.findByEmail = async () => null;

    try {
      await assert.rejects(
        async () => {
          await authService.login('inexistente@integra.com', '123456');
        },
        (err) => {
          assert.equal(err.status, 401);
          assert.match(err.message, /Credenciais inválidas/);
          return true;
        }
      );
    } finally {
      userRepository.findByEmail = originalFindByEmail;
    }
  });

  it('deve rejeitar login com erro 401 se senha estiver incorreta', async () => {
    const originalFindByEmail = userRepository.findByEmail;
    userRepository.findByEmail = async () => ({
      userId: 'A0EEBC999C0B4EF8BB6D6BB9BD380A11',
      userName: 'Ana Passageira',
      userEmail: 'ana@integra.com',
      userPassword: hashPassword('senhaCorreta').toString('hex'),
      userPassanger: 1,
      userDriver: 0,
      userOperator: 0,
    });

    try {
      await assert.rejects(
        async () => {
          await authService.login('ana@integra.com', 'senhaErrada');
        },
        (err) => {
          assert.equal(err.status, 401);
          assert.match(err.message, /Credenciais inválidas/);
          return true;
        }
      );
    } finally {
      userRepository.findByEmail = originalFindByEmail;
    }
  });

  it('deve retornar erro 400 se e-mail ou senha não forem fornecidos', async () => {
    await assert.rejects(
      async () => {
        await authService.login('', '123');
      },
      (err) => {
        assert.equal(err.status, 400);
        return true;
      }
    );
  });
});
