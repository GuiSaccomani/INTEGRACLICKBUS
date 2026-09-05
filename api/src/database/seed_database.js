const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const crypto = require('crypto');
const db = require('../database');
const { hashPassword } = require('../utils/passwordVerifier');

async function seed() {
  await db.initPool();
  const conn = await db.getConnection();
  try {
    console.log('Iniciando seed no Banco de Dados...');

    const passHashHex = hashPassword('123456').toString('hex');
    const passUserId = crypto.randomBytes(16).toString('hex').toUpperCase();
    const driverUserId = crypto.randomBytes(16).toString('hex').toUpperCase();

    // 1. Limpar usuários e registros antigos
    try {
      await conn.execute("DELETE FROM USERS WHERE USER_EMAIL IN ('passageiro@integra.com', 'motorista@integra.com')");
    } catch (e) { console.log('Users cleanup:', e.message); }

    // 2. Inserir Passageiro
    await conn.execute(`
      INSERT INTO USERS (USER_ID, USER_NAME, USER_EMAIL, USER_PASSWORD, USER_PASSANGER, USER_DRIVER, USER_OPERATOR)
      VALUES (HEXTORAW(:userId), :userName, :userEmail, HEXTORAW(:userPassword), 1, 0, 0)
    `, {
      userId: passUserId,
      userName: 'Guilherme Santos',
      userEmail: 'passageiro@integra.com',
      userPassword: passHashHex,
    });
    console.log('✅ Passageiro inserido com sucesso!');

    // 3. Inserir Motorista
    await conn.execute(`
      INSERT INTO USERS (USER_ID, USER_NAME, USER_EMAIL, USER_PASSWORD, USER_PASSANGER, USER_DRIVER, USER_OPERATOR)
      VALUES (HEXTORAW(:userId), :userName, :userEmail, HEXTORAW(:userPassword), 0, 1, 0)
    `, {
      userId: driverUserId,
      userName: 'Carlos Eduardo Mendes',
      userEmail: 'motorista@integra.com',
      userPassword: passHashHex,
    });
    console.log('✅ Motorista inserido com sucesso!');

    // 4. Inserir Viagem (Trip)
    const tripId = crypto.randomBytes(16).toString('hex').toUpperCase();
    await conn.execute(`
      INSERT INTO TRIPS (TRIP_ID, TRIP_DATE, TRIP_DEPARTURE, TRIP_ARRIVAL, TRIP_TICKETS, TRIP_OCUPATION, TRIP_DRIVER)
      VALUES (HEXTORAW(:tripId), SYSDATE + 1, 'São Paulo - Tietê', 'Rio de Janeiro - Novo Rio', 40, 1, HEXTORAW(:driverId))
    `, {
      tripId,
      driverId: driverUserId,
    });
    console.log('✅ Viagem inserida com sucesso!');

    // 5. Inserir Ticket (Passagem)
    const ticketId = crypto.randomBytes(16).toString('hex').toUpperCase();
    await conn.execute(`
      INSERT INTO TICKETS (TICKET_ID, TICKET_TRIP, TICKET_SEAT, TICKET_SOLD, TICKET_USED)
      VALUES (HEXTORAW(:ticketId), HEXTORAW(:tripId), 14, 1, 0)
    `, {
      ticketId,
      tripId,
    });
    console.log('✅ Passagem inserida com sucesso!');

    // 6. Vincular Usuário à Passagem (USERS_TICKETS com UT_ID e UT_HASH)
    const utId = crypto.randomBytes(16).toString('hex').toUpperCase();
    const utHash = crypto.randomBytes(32).toString('hex').toUpperCase();
    await conn.execute(`
      INSERT INTO USERS_TICKETS (UT_ID, UT_USER, UT_TICKET, UT_HASH)
      VALUES (HEXTORAW(:utId), HEXTORAW(:userId), HEXTORAW(:ticketId), HEXTORAW(:utHash))
    `, {
      utId,
      userId: passUserId,
      ticketId,
      utHash,
    });
    console.log('✅ USERS_TICKETS vinculado com sucesso!');

    // Commit no Oracle
    await conn.commit();
    console.log('🎉 TODOS OS DADOS FORAM GRAVADOS E COMITADOS NO BANCO DE DADOS COM SUCESSO!');
  } catch (err) {
    console.error('❌ Erro no seed:', err);
    await conn.rollback();
  } finally {
    await conn.close();
    await db.closePool();
  }
}

seed();
