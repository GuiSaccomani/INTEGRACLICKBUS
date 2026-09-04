const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const rawHelper = require('../src/utils/rawHelper');

describe('rawHelper - Utilitário RAW(16) e RAW(32)', () => {
  it('deve normalizar UUID de 36 caracteres para RAW(16) de 32 hex chars e 16 bytes', () => {
    const uuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const result = rawHelper.normalizeRaw16(uuid);

    assert.equal(result.hex.length, 32);
    assert.equal(result.hex, 'A0EEBC999C0B4EF8BB6D6BB9BD380A11');
    assert.equal(result.buffer.length, 16);
  });

  it('deve normalizar string hexadecimal de 32 caracteres maiúscula/minúscula', () => {
    const hex = '0123456789abcdef0123456789abcdef';
    const result = rawHelper.normalizeRaw16(hex);

    assert.equal(result.hex, '0123456789ABCDEF0123456789ABCDEF');
    assert.equal(result.buffer.length, 16);
  });

  it('deve rejeitar identificador RAW(16) inválido (comprimento ou caracteres inválidos)', () => {
    assert.throws(() => rawHelper.normalizeRaw16('invalido'), /Identificador RAW\(16\) inválido/);
    assert.throws(() => rawHelper.normalizeRaw16(''), /Identificador RAW\(16\) não pode ser nulo/);
    assert.throws(() => rawHelper.normalizeRaw16(null), /Identificador RAW\(16\) não pode ser nulo/);
  });

  it('deve normalizar hash RAW(32) de 64 hex chars e 32 bytes', () => {
    const hex64 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const result = rawHelper.normalizeRaw32(hex64);

    assert.equal(result.hex.length, 64);
    assert.equal(result.buffer.length, 32);
  });

  it('deve rejeitar hash RAW(32) com comprimento diferente de 64 caracteres hex', () => {
    assert.throws(() => rawHelper.normalizeRaw32('abc123'), /Identificador RAW\(32\) inválido/);
  });

  it('deve converter buffer retornado pelo Oracle em string hexadecimal limpa', () => {
    const buf = Buffer.from('A0EEBC999C0B4EF8BB6D6BB9BD380A11', 'hex');
    const hex = rawHelper.rawToHex(buf);
    assert.equal(hex, 'A0EEBC999C0B4EF8BB6D6BB9BD380A11');
  });

  it('deve formatar 32 hex chars para formato UUID padrão com hífens', () => {
    const hex = 'A0EEBC999C0B4EF8BB6D6BB9BD380A11';
    const uuid = rawHelper.hexToUuid(hex);
    assert.equal(uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
  });

  it('deve gerar RAW(16) e RAW(32) com comprimentos exatos', () => {
    const r16 = rawHelper.generateRaw16();
    assert.equal(r16.buffer.length, 16);
    assert.equal(r16.hex.length, 32);

    const r32 = rawHelper.generateRaw32();
    assert.equal(r32.buffer.length, 32);
    assert.equal(r32.hex.length, 64);
  });
});
