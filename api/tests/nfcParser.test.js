const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Implementação espelho para execução nos testes Node.js
const NFC_PAYLOAD_PREFIX = {
  BAGGAGE: 'integra:baggage:v1:',
  CREDENTIAL: 'integra:credential:v1:',
};

function formatBaggageNdefPayload(baggageId) {
  if (!baggageId || typeof baggageId !== 'string') {
    throw new Error('Identificador de bagagem inválido para formatação NDEF.');
  }
  const cleanId = baggageId.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  return `${NFC_PAYLOAD_PREFIX.BAGGAGE}${cleanId}`;
}

function parseBaggageNdefPayload(textPayload, serialNumber) {
  if (!textPayload || typeof textPayload !== 'string') return null;
  const trimmed = textPayload.trim();
  if (!trimmed.startsWith(NFC_PAYLOAD_PREFIX.BAGGAGE)) {
    const hexOnly = trimmed.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
    if (hexOnly.length === 64) {
      return {
        version: 1,
        baggageId: hexOnly,
        tagPhysicalUid: serialNumber || undefined,
        rawPayload: trimmed,
        timestamp: Date.now(),
      };
    }
    return null;
  }
  const rawId = trimmed.slice(NFC_PAYLOAD_PREFIX.BAGGAGE.length);
  const cleanBaggageId = rawId.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  if (cleanBaggageId.length === 0) return null;
  return {
    version: 1,
    baggageId: cleanBaggageId,
    tagPhysicalUid: serialNumber || undefined,
    rawPayload: trimmed,
    timestamp: Date.now(),
  };
}

function parseCredentialNdefPayload(textPayload, serialNumber) {
  if (!textPayload || typeof textPayload !== 'string') return null;
  const trimmed = textPayload.trim();
  if (!trimmed.startsWith(NFC_PAYLOAD_PREFIX.CREDENTIAL)) {
    const hexOnly = trimmed.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
    if (hexOnly.length === 64 || hexOnly.length === 32) {
      return {
        version: 1,
        credentialRef: hexOnly,
        tagPhysicalUid: serialNumber || undefined,
        rawPayload: trimmed,
        timestamp: Date.now(),
      };
    }
    return null;
  }
  const rawRef = trimmed.slice(NFC_PAYLOAD_PREFIX.CREDENTIAL.length);
  const cleanRef = rawRef.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  if (cleanRef.length === 0) return null;
  return {
    version: 1,
    credentialRef: cleanRef,
    tagPhysicalUid: serialNumber || undefined,
    rawPayload: trimmed,
    timestamp: Date.now(),
  };
}

describe('Módulo NFC Parser - Payloads NDEF', () => {
  it('deve formatar payload de bagagem com prefixo de versão e BAGGAGE_ID em maiúsculas', () => {
    const baggageId = 'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899';
    const payload = formatBaggageNdefPayload(baggageId);
    assert.equal(payload, `integra:baggage:v1:${baggageId.toUpperCase()}`);
  });

  it('deve decodificar payload de bagagem e manter o UID físico separado do BAGGAGE_ID', () => {
    const baggageId = 'AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233445566778899';
    const payload = `integra:baggage:v1:${baggageId}`;
    const physicalUid = '04:A1:B2:C3:D4:E5:F6';

    const parsed = parseBaggageNdefPayload(payload, physicalUid);
    assert.ok(parsed);
    assert.equal(parsed.baggageId, baggageId);
    assert.equal(parsed.tagPhysicalUid, physicalUid);
    assert.notEqual(parsed.tagPhysicalUid, parsed.baggageId); // Não confunde UID com BAGGAGE_ID
  });

  it('deve decodificar payload de credencial por UT_HASH', () => {
    const utHash = '1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF';
    const payload = `integra:credential:v1:${utHash}`;

    const parsed = parseCredentialNdefPayload(payload);
    assert.ok(parsed);
    assert.equal(parsed.credentialRef, utHash);
  });

  it('deve retornar null para payloads inválidos ou não reconhecidos', () => {
    assert.equal(parseBaggageNdefPayload('qualquer-coisa-invalida'), null);
    assert.equal(parseBaggageNdefPayload(''), null);
    assert.equal(parseCredentialNdefPayload('invalido'), null);
  });
});
