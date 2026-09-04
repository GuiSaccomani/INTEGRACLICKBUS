const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const db = require('../src/database');

describe('API Routes & Middlewares - Health Check e Tratamento de Erros', () => {
  it('deve responder 200 no GET /health com status UP', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const response = await fetch(`http://localhost:${port}/health`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.status, 'UP');
      assert.equal(body.service, 'integra-api');
    } finally {
      server.close();
    }
  });

  it('deve responder GET /health/db com status correspondente ao banco Oracle', async () => {
    const origCheckHealth = db.checkHealth;
    db.checkHealth = async () => ({
      status: 'UP',
      database: 'Oracle Database',
      timestamp: new Date().toISOString(),
    });

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const response = await fetch(`http://localhost:${port}/health/db`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.status, 'UP');
      assert.equal(body.database, 'Oracle Database');
    } finally {
      db.checkHealth = origCheckHealth;
      server.close();
    }
  });

  it('deve responder 503 no GET /health/db se o pool Oracle estiver indisponível', async () => {
    const origCheckHealth = db.checkHealth;
    db.checkHealth = async () => ({
      status: 'DOWN',
      database: 'Oracle Database',
      error: 'ORA-12541: TNS:no listener',
      timestamp: new Date().toISOString(),
    });

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const response = await fetch(`http://localhost:${port}/health/db`);
      const body = await response.json();

      assert.equal(response.status, 503);
      assert.equal(body.status, 'DOWN');
    } finally {
      db.checkHealth = origCheckHealth;
      server.close();
    }
  });
});
