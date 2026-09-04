const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const userRepository = require('../src/repositories/userRepository');
const ticketRepository = require('../src/repositories/ticketRepository');
const { hashPassword } = require('../src/utils/passwordVerifier');

describe('Validação Completa dos Endpoints HTTP da API', () => {
  it('GET /health deve retornar status 200 e UP', async () => {
    const server = app.listen(0);
    const port = server.address().port;
    try {
      const res = await fetch(`http://localhost:${port}/health`);
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.status, 'UP');
    } finally {
      server.close();
    }
  });

  it('POST /login deve autenticar com sucesso contra USERS e retornar papéis sem vazar senha', async () => {
    const origFindByEmail = userRepository.findByEmail;
    userRepository.findByEmail = async () => ({
      userId: 'A0EEBC999C0B4EF8BB6D6BB9BD380A11',
      userName: 'Motorista Teste',
      userEmail: 'motorista@integra.com',
      userPassword: hashPassword('senhaValida123').toString('hex'),
      userPassanger: 0,
      userDriver: 1,
      userOperator: 0,
    });

    const server = app.listen(0);
    const port = server.address().port;
    try {
      const res = await fetch(`http://localhost:${port}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'motorista@integra.com', password: 'senhaValida123' }),
      });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.user.userName, 'Motorista Teste');
      assert.equal(body.user.roles.isDriver, true);
      assert.equal(body.user.userPassword, undefined); // Sem vazamento de senha
    } finally {
      userRepository.findByEmail = origFindByEmail;
      server.close();
    }
  });

  it('POST /login com senha errada deve retornar 401', async () => {
    const origFindByEmail = userRepository.findByEmail;
    userRepository.findByEmail = async () => ({
      userId: 'A0EEBC999C0B4EF8BB6D6BB9BD380A11',
      userName: 'Motorista Teste',
      userEmail: 'motorista@integra.com',
      userPassword: hashPassword('senhaValida123').toString('hex'),
      userPassanger: 0,
      userDriver: 1,
      userOperator: 0,
    });

    const server = app.listen(0);
    const port = server.address().port;
    try {
      const res = await fetch(`http://localhost:${port}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'motorista@integra.com', password: 'senhaIncorreta' }),
      });
      const body = await res.json();

      assert.equal(res.status, 401);
      assert.match(body.error, /Credenciais inválidas/);
    } finally {
      userRepository.findByEmail = origFindByEmail;
      server.close();
    }
  });

  it('GET /passenger/ticket/:id inexistente deve retornar 404', async () => {
    const origFindTicket = ticketRepository.findById;
    ticketRepository.findById = async () => null;

    const server = app.listen(0);
    const port = server.address().port;
    try {
      const res = await fetch(`http://localhost:${port}/passenger/ticket/A0EEBC999C0B4EF8BB6D6BB9BD380A11`);
      const body = await res.json();

      assert.equal(res.status, 404);
      assert.match(body.error, /não encontrado/);
    } finally {
      ticketRepository.findById = origFindTicket;
      server.close();
    }
  });

  it('POST /luggages sem ticketId deve retornar 400', async () => {
    const server = app.listen(0);
    const port = server.address().port;
    try {
      const res = await fetch(`http://localhost:${port}/luggages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await res.json();

      assert.equal(res.status, 400);
      assert.match(body.error, /obrigatório/);
    } finally {
      server.close();
    }
  });
});
