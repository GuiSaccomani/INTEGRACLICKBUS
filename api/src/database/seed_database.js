const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const crypto = require('crypto');
const db = require('../database');
const { hashPassword } = require('../utils/passwordVerifier');

/**
 * Função modular de seed que pode ser executada isoladamente ou via endpoint de desenvolvimento
 */
async function runSeed(conn) {
  console.log('Iniciando seed de múltiplas viagens no Banco de Dados Oracle...');

  const passHashHex = hashPassword('123456').toString('hex');

  // 1. Obter ou criar Passageiro
  let passUserId;
  const passCheck = await conn.execute(
    "SELECT RAWTOHEX(USER_ID) AS USER_ID FROM USERS WHERE USER_EMAIL = 'passageiro@integra.com'"
  );
  if (passCheck.rows && passCheck.rows.length > 0) {
    passUserId = passCheck.rows[0].USER_ID;
    console.log('✅ Passageiro existente reutilizado:', passUserId);
  } else {
    passUserId = crypto.randomBytes(16).toString('hex').toUpperCase();
    await conn.execute(`
      INSERT INTO USERS (USER_ID, USER_NAME, USER_EMAIL, USER_PASSWORD, USER_PASSANGER, USER_DRIVER, USER_OPERATOR)
      VALUES (HEXTORAW(:userId), :userName, :userEmail, HEXTORAW(:userPassword), 1, 0, 0)
    `, {
      userId: passUserId,
      userName: 'Guilherme Santos',
      userEmail: 'passageiro@integra.com',
      userPassword: passHashHex,
    });
    console.log('✅ Passageiro criado com sucesso!');
  }

  // 2. Obter ou criar Motorista
  let driverUserId;
  const driverCheck = await conn.execute(
    "SELECT RAWTOHEX(USER_ID) AS USER_ID FROM USERS WHERE USER_EMAIL = 'motorista@integra.com'"
  );
  if (driverCheck.rows && driverCheck.rows.length > 0) {
    driverUserId = driverCheck.rows[0].USER_ID;
    console.log('✅ Motorista existente reutilizado:', driverUserId);
  } else {
    driverUserId = crypto.randomBytes(16).toString('hex').toUpperCase();
    await conn.execute(`
      INSERT INTO USERS (USER_ID, USER_NAME, USER_EMAIL, USER_PASSWORD, USER_PASSANGER, USER_DRIVER, USER_OPERATOR)
      VALUES (HEXTORAW(:userId), :userName, :userEmail, HEXTORAW(:userPassword), 0, 1, 0)
    `, {
      userId: driverUserId,
      userName: 'Carlos Eduardo Mendes',
      userEmail: 'motorista@integra.com',
      userPassword: passHashHex,
    });
    console.log('✅ Motorista criado com sucesso!');
  }

  // 3. Limpeza limpa de dados anteriores de viagens/bilhetes deste passageiro e motorista
  try {
    await conn.execute("DELETE FROM LUGGAGES WHERE LUGGAGE_TICKET IN (SELECT UT_TICKET FROM USERS_TICKETS WHERE UT_USER = HEXTORAW(:passUserId))", { passUserId });
    await conn.execute("DELETE FROM USERS_TICKETS WHERE UT_USER = HEXTORAW(:passUserId)", { passUserId });
    await conn.execute("DELETE FROM TICKETS WHERE TICKET_TRIP IN (SELECT TRIP_ID FROM TRIPS WHERE TRIP_DRIVER = HEXTORAW(:driverUserId))", { driverUserId });
    await conn.execute("DELETE FROM TRIPS WHERE TRIP_DRIVER = HEXTORAW(:driverUserId)", { driverUserId });
  } catch (cleanErr) {
    console.warn('Aviso na limpeza prévia:', cleanErr.message);
  }

  // 4. Múltiplas Viagens e Bilhetes Futuros para Gravação e Teste
  const tripsData = [
    {
      departure: 'São Paulo - Tietê',
      arrival: 'Rio de Janeiro - Novo Rio',
      daysOffset: 1,
      seat: 14,
      totalSeats: 40,
    },
    {
      departure: 'Rio de Janeiro - Novo Rio',
      arrival: 'São Paulo - Tietê',
      daysOffset: 3,
      seat: 8,
      totalSeats: 42,
    },
    {
      departure: 'São Paulo - Barra Funda',
      arrival: 'Curitiba - Rodoferroviária',
      daysOffset: 5,
      seat: 22,
      totalSeats: 44,
    },
    {
      departure: 'Curitiba - Rodoferroviária',
      arrival: 'Florianópolis - Rita Maria',
      daysOffset: 7,
      seat: 11,
      totalSeats: 38,
    },
    {
      departure: 'São Paulo - Tietê',
      arrival: 'Belo Horizonte - Central',
      daysOffset: 10,
      seat: 5,
      totalSeats: 46,
    },
  ];

  for (let i = 0; i < tripsData.length; i++) {
    const item = tripsData[i];
    const tripId = crypto.randomBytes(16).toString('hex').toUpperCase();

    // Inserir Viagem
    await conn.execute(`
      INSERT INTO TRIPS (TRIP_ID, TRIP_DATE, TRIP_DEPARTURE, TRIP_ARRIVAL, TRIP_TICKETS, TRIP_OCUPATION, TRIP_DRIVER)
      VALUES (HEXTORAW(:tripId), SYSDATE + :daysOffset, :departure, :arrival, :totalSeats, 1, HEXTORAW(:driverId))
    `, {
      tripId,
      daysOffset: item.daysOffset,
      departure: item.departure,
      arrival: item.arrival,
      totalSeats: item.totalSeats,
      driverId: driverUserId,
    });

    // Inserir Passagem principal do passageiro (TICKET_USED = 0)
    const ticketId = crypto.randomBytes(16).toString('hex').toUpperCase();
    await conn.execute(`
      INSERT INTO TICKETS (TICKET_ID, TICKET_TRIP, TICKET_SEAT, TICKET_SOLD, TICKET_USED)
      VALUES (HEXTORAW(:ticketId), HEXTORAW(:tripId), :seat, 1, 0)
    `, {
      ticketId,
      tripId,
      seat: item.seat,
    });

    // Vincular Usuário à Passagem com UT_HASH
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

    // Na primeira viagem, adiciona outros passageiros de exemplo para a lista do motorista
    if (i === 0) {
      const extraPassengers = [
        { name: 'Mariana Costa', email: 'mariana.costa@email.com', seat: 15, used: 1 },
        { name: 'Lucas Albuquerque', email: 'lucas.alb@email.com', seat: 16, used: 0 },
        { name: 'Beatriz Lima', email: 'beatriz.lima@email.com', seat: 17, used: 0 },
      ];

      for (const extra of extraPassengers) {
        const extraUserId = crypto.randomBytes(16).toString('hex').toUpperCase();
        await conn.execute(`
          INSERT INTO USERS (USER_ID, USER_NAME, USER_EMAIL, USER_PASSWORD, USER_PASSANGER, USER_DRIVER, USER_OPERATOR)
          VALUES (HEXTORAW(:userId), :userName, :userEmail, HEXTORAW(:userPassword), 1, 0, 0)
        `, {
          userId: extraUserId,
          userName: extra.name,
          userEmail: extra.email,
          userPassword: passHashHex,
        });

        const extraTicketId = crypto.randomBytes(16).toString('hex').toUpperCase();
        await conn.execute(`
          INSERT INTO TICKETS (TICKET_ID, TICKET_TRIP, TICKET_SEAT, TICKET_SOLD, TICKET_USED)
          VALUES (HEXTORAW(:ticketId), HEXTORAW(:tripId), :seat, 1, :used)
        `, {
          ticketId: extraTicketId,
          tripId,
          seat: extra.seat,
          used: extra.used,
        });

        const extraUtId = crypto.randomBytes(16).toString('hex').toUpperCase();
        const extraUtHash = crypto.randomBytes(32).toString('hex').toUpperCase();
        await conn.execute(`
          INSERT INTO USERS_TICKETS (UT_ID, UT_USER, UT_TICKET, UT_HASH)
          VALUES (HEXTORAW(:utId), HEXTORAW(:userId), HEXTORAW(:ticketId), HEXTORAW(:utHash))
        `, {
          utId: extraUtId,
          userId: extraUserId,
          ticketId: extraTicketId,
          utHash: extraUtHash,
        });
      }
    }

    console.log(`✅ Viagem ${i + 1} (${item.departure} → ${item.arrival}) cadastrada com sucesso!`);
  }

  // Commit das transações no Oracle
  await conn.commit();
  console.log('🎉 TODAS AS 5 VIAGENS E PASSAGENS FORAM GRAVADAS NO ORACLE COM SUCESSO!');
  return { passUserId, driverUserId, tripsCount: tripsData.length };
}

async function seed() {
  await db.initPool();
  const conn = await db.getConnection();
  try {
    await runSeed(conn);
  } catch (err) {
    console.error('❌ Erro no seed:', err);
    await conn.rollback();
  } finally {
    await conn.close();
    await db.closePool();
  }
}

if (require.main === module) {
  seed();
}

module.exports = { runSeed };
