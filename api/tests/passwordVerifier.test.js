const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { verifyPassword, hashPassword } = require('../src/utils/passwordVerifier');

describe('passwordVerifier - Módulo isolado de verificação de senhas Oracle RAW(32)', () => {
  it('deve validar com sucesso a senha correta gerada com o algoritmo configurado', () => {
    const plain = 'senhaSegura123';
    const hash = hashPassword(plain);

    const valid = verifyPassword(plain, hash);
    assert.equal(valid, true);
  });

  it('deve rejeitar senha incorreta', () => {
    const plain = 'senhaSegura123';
    const hash = hashPassword(plain);

    const valid = verifyPassword('senhaErrada', hash);
    assert.equal(valid, false);
  });

  it('deve retornar false se a senha ou o hash forem nulos/vazios', () => {
    assert.equal(verifyPassword('', 'abc'), false);
    assert.equal(verifyPassword('123', null), false);
    assert.equal(verifyPassword(null, null), false);
  });

  it('deve aceitar hash em formato string hex de 64 caracteres ou Buffer', () => {
    const plain = 'teste123';
    const hashBuf = hashPassword(plain);
    const hashHex = hashBuf.toString('hex');

    assert.equal(verifyPassword(plain, hashBuf), true);
    assert.equal(verifyPassword(plain, hashHex), true);
  });
});
