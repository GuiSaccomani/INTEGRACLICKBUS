const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const passengerService = require('../src/services/passengerService');
const luggageService = require('../src/services/luggageService');
const ticketRepository = require('../src/repositories/ticketRepository');
const luggageRepository = require('../src/repositories/luggageRepository');

describe('Validação de Credencial (NFC / QR Code) e Consulta de Bagagem', () => {
  it('deve validar credencial com sucesso por UT_HASH (64 hex chars) via Oracle', async () => {
    const fakeUtHash = 'E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1';
    const fakeTicket = {
      ticketId: 'A0EEBC999C0B4EF8BB6D6BB9BD380A11',
      tripId: 'B1FFCD888D0C4EF8AA5E5AA8AC270B22',
      seat: 14,
      sold: 1,
      used: 0,
      passengerName: 'Carlos Eduardo',
      departure: 'São Paulo',
      arrival: 'Belo Horizonte',
      utHash: fakeUtHash,
    };

    // Mocks dos repositórios
    const origFindByUtHash = ticketRepository.findByUtHash;
    const origFindById = ticketRepository.findById;
    const origValidateAndMarkUsed = ticketRepository.validateAndMarkUsed;
    const origFindLuggages = luggageRepository.findByTicketId;

    ticketRepository.findByUtHash = async (hash) => {
      if (hash === fakeUtHash) return fakeTicket;
      return null;
    };
    ticketRepository.findById = async (id) => fakeTicket;
    ticketRepository.validateAndMarkUsed = async () => 1;
    luggageRepository.findByTicketId = async () => [
      { baggageId: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF', baggageUtHash: fakeUtHash }
    ];

    try {
      const result = await passengerService.validateCredential(fakeUtHash);
      assert.equal(result.validated, true);
      assert.equal(result.passengerName, 'Carlos Eduardo');
      assert.equal(result.seat, 14);
      assert.equal(result.luggagesCount, 1);
    } finally {
      ticketRepository.findByUtHash = origFindByUtHash;
      ticketRepository.findById = origFindById;
      ticketRepository.validateAndMarkUsed = origValidateAndMarkUsed;
      luggageRepository.findByTicketId = origFindLuggages;
    }
  });

  it('deve aceitar credencial formatada com prefixo NDEF ("integra:credential:v1:<hash>")', async () => {
    const fakeUtHash = '11223344556677889900AABBCCDDEEFF11223344556677889900AABBCCDDEEFF';
    const fakeTicket = {
      ticketId: 'C0EEBC999C0B4EF8BB6D6BB9BD380A33',
      tripId: 'D1FFCD888D0C4EF8AA5E5AA8AC270B44',
      seat: 22,
      sold: 1,
      used: 0,
      passengerName: 'Marcos Oliveira',
      departure: 'São Paulo',
      arrival: 'Rio de Janeiro',
      utHash: fakeUtHash,
    };

    const origFindByUtHash = ticketRepository.findByUtHash;
    const origFindById = ticketRepository.findById;
    const origValidateAndMarkUsed = ticketRepository.validateAndMarkUsed;
    const origFindLuggages = luggageRepository.findByTicketId;

    ticketRepository.findByUtHash = async () => fakeTicket;
    ticketRepository.findById = async () => fakeTicket;
    ticketRepository.validateAndMarkUsed = async () => 1;
    luggageRepository.findByTicketId = async () => [];

    try {
      const payloadWithPrefix = `integra:credential:v1:${fakeUtHash}`;
      const result = await passengerService.validateCredential(payloadWithPrefix);
      assert.equal(result.validated, true);
      assert.equal(result.passengerName, 'Marcos Oliveira');
      assert.equal(result.seat, 22);
    } finally {
      ticketRepository.findByUtHash = origFindByUtHash;
      ticketRepository.findById = origFindById;
      ticketRepository.validateAndMarkUsed = origValidateAndMarkUsed;
      luggageRepository.findByTicketId = origFindLuggages;
    }
  });

  it('deve rejeitar credencial vazia ou com formato inválido', async () => {
    await assert.rejects(
      async () => passengerService.validateCredential(''),
      (err) => err.status === 400
    );

    await assert.rejects(
      async () => passengerService.validateCredential('123'),
      (err) => err.status === 400
    );
  });

  it('deve consultar detalhes completos da bagagem por BAGGAGE_ID através dos JOINs oficiais', async () => {
    const fakeBaggageId = 'FFAA11223344556677889900AABBCCDDFFAA11223344556677889900AABBCCDD';
    const fakeDetails = {
      baggageId: fakeBaggageId,
      baggageUtHash: '11223344556677889900AABBCCDDEEFF11223344556677889900AABBCCDDEEFF',
      ticketId: 'A0EEBC999C0B4EF8BB6D6BB9BD380A11',
      passengerName: 'Guilherme Santos',
      seat: 18,
      departure: 'São Paulo',
      arrival: 'Rio de Janeiro',
    };

    const origFindDetails = luggageRepository.findDetailsById;
    luggageRepository.findDetailsById = async (id) => {
      if (id === fakeBaggageId) return fakeDetails;
      return null;
    };

    try {
      const luggage = await luggageService.getLuggageDetails(fakeBaggageId);
      assert.equal(luggage.baggageId, fakeBaggageId);
      assert.equal(luggage.passengerName, 'Guilherme Santos');
      assert.equal(luggage.seat, 18);
    } finally {
      luggageRepository.findDetailsById = origFindDetails;
    }
  });

  it('deve retornar erro 404 se a bagagem não existir no Oracle', async () => {
    const origFindDetails = luggageRepository.findDetailsById;
    luggageRepository.findDetailsById = async () => null;

    try {
      await assert.rejects(
        async () => luggageService.getLuggageDetails('FFAA11223344556677889900AABBCCDDFFAA11223344556677889900AABBCCDD'),
        (err) => err.status === 404
      );
    } finally {
      luggageRepository.findDetailsById = origFindDetails;
    }
  });
});
