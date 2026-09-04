const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const passengerService = require('../src/services/passengerService');
const ticketRepository = require('../src/repositories/ticketRepository');
const luggageRepository = require('../src/repositories/luggageRepository');

describe('PassengerService - Consulta e Validação de Passagem com Concorrência', () => {
  it('deve consultar os detalhes da passagem e derivar campos corretamente do Oracle', async () => {
    const origFindTicket = ticketRepository.findById;
    const origFindLuggage = luggageRepository.findByTicketId;

    ticketRepository.findById = async () => ({
      ticketId: 'A1B2C3D4E5F60102030405060708090A',
      tripId: 'F1F2F3F4F5F60102030405060708090A',
      seat: 18,
      sold: 1,
      used: 0,
      passengerName: 'João da Silva',
      departure: 'São Paulo',
      arrival: 'Rio de Janeiro',
      tripDate: new Date('2026-09-01'),
      utHash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
    });

    luggageRepository.findByTicketId = async () => [
      { baggageId: 'B1B2B3B4B5B60102030405060708090A0102030405060708090A0B0C0D0E0F10', baggageUtHash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855' }
    ];

    try {
      const result = await passengerService.getTicketDetails('A1B2C3D4E5F60102030405060708090A');
      assert.equal(result.ticket.passengerName, 'João da Silva');
      assert.equal(result.ticket.seat, 18);
      assert.equal(result.ticket.departure, 'São Paulo');
      assert.equal(result.ticket.arrival, 'Rio de Janeiro');
      assert.equal(result.luggages.length, 1);
    } finally {
      ticketRepository.findById = origFindTicket;
      luggageRepository.findByTicketId = origFindLuggage;
    }
  });

  it('deve validar o bilhete com atomicidade se vendido e ainda não utilizado', async () => {
    const origFindTicket = ticketRepository.findById;
    const origValidate = ticketRepository.validateAndMarkUsed;
    const origFindLuggage = luggageRepository.findByTicketId;

    ticketRepository.findById = async () => ({
      ticketId: 'A1B2C3D4E5F60102030405060708090A',
      tripId: 'F1F2F3F4F5F60102030405060708090A',
      seat: 18,
      sold: 1,
      used: 0,
      passengerName: 'Maria Santos',
    });

    ticketRepository.validateAndMarkUsed = async () => 1; // 1 linha afetada com sucesso
    luggageRepository.findByTicketId = async () => [];

    try {
      const result = await passengerService.validateTicket('A1B2C3D4E5F60102030405060708090A');
      assert.equal(result.validated, true);
      assert.equal(result.used, 1);
      assert.equal(result.passengerName, 'Maria Santos');
    } finally {
      ticketRepository.findById = origFindTicket;
      ticketRepository.validateAndMarkUsed = origValidate;
      luggageRepository.findByTicketId = origFindLuggage;
    }
  });

  it('deve rejeitar com 409 se a passagem já tiver sido utilizada', async () => {
    const origFindTicket = ticketRepository.findById;

    ticketRepository.findById = async () => ({
      ticketId: 'A1B2C3D4E5F60102030405060708090A',
      sold: 1,
      used: 1, // Já utilizada
    });

    try {
      await assert.rejects(
        async () => {
          await passengerService.validateTicket('A1B2C3D4E5F60102030405060708090A');
        },
        (err) => {
          assert.equal(err.status, 409);
          assert.match(err.message, /já foi utilizada/);
          return true;
        }
      );
    } finally {
      ticketRepository.findById = origFindTicket;
    }
  });

  it('deve rejeitar com 409 se a concorrência afetar 0 linhas no UPDATE atômico', async () => {
    const origFindTicket = ticketRepository.findById;
    const origValidate = ticketRepository.validateAndMarkUsed;

    ticketRepository.findById = async () => ({
      ticketId: 'A1B2C3D4E5F60102030405060708090A',
      sold: 1,
      used: 0,
    });

    ticketRepository.validateAndMarkUsed = async () => 0; // 0 linhas afetadas (outra thread atualizou primeiro)

    try {
      await assert.rejects(
        async () => {
          await passengerService.validateTicket('A1B2C3D4E5F60102030405060708090A');
        },
        (err) => {
          assert.equal(err.status, 409);
          assert.match(err.message, /Conflito/);
          return true;
        }
      );
    } finally {
      ticketRepository.findById = origFindTicket;
      ticketRepository.validateAndMarkUsed = origValidate;
    }
  });

  it('deve rejeitar com 404 se o bilhete não existir no banco', async () => {
    const origFindTicket = ticketRepository.findById;
    ticketRepository.findById = async () => null;

    try {
      await assert.rejects(
        async () => {
          await passengerService.validateTicket('00000000000000000000000000000000');
        },
        (err) => {
          assert.equal(err.status, 404);
          return true;
        }
      );
    } finally {
      ticketRepository.findById = origFindTicket;
    }
  });
});
