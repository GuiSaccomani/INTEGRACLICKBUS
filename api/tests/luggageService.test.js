const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const luggageService = require('../src/services/luggageService');
const ticketRepository = require('../src/repositories/ticketRepository');
const usersTicketsRepository = require('../src/repositories/usersTicketsRepository');
const luggageRepository = require('../src/repositories/luggageRepository');
const db = require('../src/database');

describe('LuggageService - Cadastro, Vínculo a UT_HASH e Transações', () => {
  it('deve vincular bagagem com sucesso através do UT_HASH de USERS_TICKETS dentro de transação', async () => {
    const origFindTicket = ticketRepository.findById;
    const origFindAssoc = usersTicketsRepository.findByTicketId;
    const origWithTx = db.withTransaction;
    const origCreateLug = luggageRepository.create;

    ticketRepository.findById = async () => ({
      ticketId: 'TK100',
      seat: 12,
      passengerName: 'Lucas Lima',
    });

    usersTicketsRepository.findByTicketId = async () => ({
      utTicket: 'TK100',
      utHash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      userName: 'Lucas Lima',
    });

    // Simula commit em transação
    db.withTransaction = async (fn) => fn({});
    luggageRepository.create = async (baggageId, utHash) => ({
      baggageId,
      baggageUtHash: utHash,
    });

    try {
      const result = await luggageService.addLuggage('TK100');
      assert.ok(result.baggageId);
      assert.equal(result.baggageId.length, 64); // RAW(32) em hex
      assert.equal(result.baggageUtHash, 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855');
      assert.equal(result.passengerName, 'Lucas Lima');
    } finally {
      ticketRepository.findById = origFindTicket;
      usersTicketsRepository.findByTicketId = origFindAssoc;
      db.withTransaction = origWithTx;
      luggageRepository.create = origCreateLug;
    }
  });

  it('deve rejeitar criação se o bilhete não possuir registro em USERS_TICKETS (sem UT_HASH)', async () => {
    const origFindTicket = ticketRepository.findById;
    const origFindAssoc = usersTicketsRepository.findByTicketId;

    ticketRepository.findById = async () => ({
      ticketId: 'TK100',
    });

    usersTicketsRepository.findByTicketId = async () => null; // Sem relação

    try {
      await assert.rejects(
        async () => {
          await luggageService.addLuggage('TK100');
        },
        (err) => {
          assert.equal(err.status, 400);
          assert.match(err.message, /USERS_TICKETS/);
          return true;
        }
      );
    } finally {
      ticketRepository.findById = origFindTicket;
      usersTicketsRepository.findByTicketId = origFindAssoc;
    }
  });

  it('deve executar rollback se ocorrer erro durante a transação de criação de bagagem', async () => {
    let rollbackCalled = false;
    const origFindTicket = ticketRepository.findById;
    const origFindAssoc = usersTicketsRepository.findByTicketId;
    const origGetConn = db.getConnection;

    ticketRepository.findById = async () => ({ ticketId: 'TK100' });
    usersTicketsRepository.findByTicketId = async () => ({
      utTicket: 'TK100',
      utHash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
    });

    const mockConn = {
      execute: async () => { throw new Error('Falha simulada de I/O no Oracle'); },
      commit: async () => {},
      rollback: async () => { rollbackCalled = true; },
      close: async () => {},
    };

    db.getConnection = async () => mockConn;

    try {
      await assert.rejects(
        async () => {
          await luggageService.addLuggage('TK100');
        },
        /Falha simulada de I\/O/
      );
      assert.equal(rollbackCalled, true);
    } finally {
      ticketRepository.findById = origFindTicket;
      usersTicketsRepository.findByTicketId = origFindAssoc;
      db.getConnection = origGetConn;
    }
  });

  it('deve remover bagagem se encontrada ou lançar 404', async () => {
    const origFindLug = luggageRepository.findById;
    luggageRepository.findById = async () => null;

    try {
      await assert.rejects(
        async () => {
          await luggageService.removeLuggage('E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855');
        },
        (err) => {
          assert.equal(err.status, 404);
          return true;
        }
      );
    } finally {
      luggageRepository.findById = origFindLug;
    }
  });
});
