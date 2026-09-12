const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const crypto = require('crypto');
const db = require('./src/database/index');

async function generate30Tickets() {
  await db.initPool();
  const conn = await db.getConnection();
  try {
    console.log('Iniciando geração de 30 passagens...');
    const passCheck = await conn.execute("SELECT RAWTOHEX(USER_ID) AS USER_ID FROM USERS WHERE USER_EMAIL = 'passageiro@integra.com'");
    if (!passCheck.rows || passCheck.rows.length === 0) {
      console.log('Passageiro não encontrado, abortando.');
      return;
    }
    const passUserId = passCheck.rows[0].USER_ID;

    const driverCheck = await conn.execute("SELECT RAWTOHEX(USER_ID) AS USER_ID FROM USERS WHERE USER_EMAIL = 'motorista@integra.com'");
    if (!driverCheck.rows || driverCheck.rows.length === 0) {
      console.log('Motorista não encontrado, abortando.');
      return;
    }
    const driverUserId = driverCheck.rows[0].USER_ID;

    for (let i = 1; i <= 30; i++) {
      const tripId = crypto.randomBytes(16).toString('hex').toUpperCase();
      await conn.execute(`
        INSERT INTO TRIPS (TRIP_ID, TRIP_DATE, TRIP_DEPARTURE, TRIP_ARRIVAL, TRIP_TICKETS, TRIP_OCUPATION, TRIP_DRIVER)
        VALUES (HEXTORAW(:tripId), SYSDATE + :daysOffset, :departure, :arrival, 40, 1, HEXTORAW(:driverId))
      `, {
        tripId,
        daysOffset: 20 + i, // future dates
        departure: 'SÃO PAULO - SP',
        arrival: 'CAMPINAS - SP',
        driverId: driverUserId,
      });

      const ticketId = crypto.randomBytes(16).toString('hex').toUpperCase();
      await conn.execute(`
        INSERT INTO TICKETS (TICKET_ID, TICKET_TRIP, TICKET_SEAT, TICKET_SOLD, TICKET_USED)
        VALUES (HEXTORAW(:ticketId), HEXTORAW(:tripId), :seat, 1, 0)
      `, {
        ticketId,
        tripId,
        seat: i,
      });

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
      console.log(`Viagem de Teste ${i} criada.`);
    }

    await conn.commit();
    console.log('30 passagens geradas com sucesso!');
  } catch (err) {
    console.error(err);
    await conn.rollback();
  } finally {
    await conn.close();
    await db.closePool();
  }
}

generate30Tickets();
