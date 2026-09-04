const db = require('../database');
const rawHelper = require('../utils/rawHelper');

class TripRepository {
  /**
   * Busca uma viagem pelo TRIP_ID
   * @param {string} tripId - Hex ou UUID
   * @returns {Promise<object|null>}
   */
  async findById(tripId) {
    const { hex } = rawHelper.normalizeRaw16(tripId);

    const sql = `
      SELECT 
        RAWTOHEX(T.TRIP_ID) AS TRIP_ID,
        T.TRIP_DATE,
        T.TRIP_DEPARTURE,
        T.TRIP_ARRIVAL,
        T.TRIP_TICKETS,
        T.TRIP_OCUPATION,
        RAWTOHEX(T.TRIP_DRIVER) AS TRIP_DRIVER,
        U.USER_NAME AS DRIVER_NAME
      FROM TRIPS T
      LEFT JOIN USERS U ON U.USER_ID = T.TRIP_DRIVER
      WHERE T.TRIP_ID = HEXTORAW(:tripId)
    `;

    const result = await db.execute(sql, { tripId: hex });
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return this._mapTrip(result.rows[0]);
  }

  /**
   * Busca as viagens vinculadas ao motorista
   * @param {string} driverId - Hex ou UUID do motorista em USERS
   * @returns {Promise<Array>}
   */
  async findByDriverId(driverId) {
    const { hex } = rawHelper.normalizeRaw16(driverId);

    const sql = `
      SELECT 
        RAWTOHEX(T.TRIP_ID) AS TRIP_ID,
        T.TRIP_DATE,
        T.TRIP_DEPARTURE,
        T.TRIP_ARRIVAL,
        T.TRIP_TICKETS,
        T.TRIP_OCUPATION,
        RAWTOHEX(T.TRIP_DRIVER) AS TRIP_DRIVER
      FROM TRIPS T
      WHERE T.TRIP_DRIVER = HEXTORAW(:driverId)
      ORDER BY T.TRIP_DATE DESC
    `;

    const result = await db.execute(sql, { driverId: hex });
    if (!result.rows) return [];
    return result.rows.map(row => this._mapTrip(row));
  }

  /**
   * Agrega métricas e resumo da viagem diretamente das tabelas TRIPS, TICKETS e BAGGAGE
   * @param {string} tripId 
   * @returns {Promise<object>}
   */
  async getTripSummary(tripId) {
    const { hex } = rawHelper.normalizeRaw16(tripId);

    const tripSql = `
      SELECT 
        RAWTOHEX(TRIP_ID) AS TRIP_ID,
        TRIP_DATE,
        TRIP_DEPARTURE,
        TRIP_ARRIVAL,
        TRIP_TICKETS,
        TRIP_OCUPATION
      FROM TRIPS
      WHERE TRIP_ID = HEXTORAW(:tripId)
    `;
    const tripResult = await db.execute(tripSql, { tripId: hex });
    if (!tripResult.rows || tripResult.rows.length === 0) {
      return null;
    }
    const trip = this._mapTrip(tripResult.rows[0]);

    const ticketsSql = `
      SELECT 
        COUNT(TK.TICKET_ID) AS TOTAL_TICKETS,
        SUM(CASE WHEN TK.TICKET_USED = 1 THEN 1 ELSE 0 END) AS BOARDED_COUNT,
        SUM(CASE WHEN TK.TICKET_SOLD = 1 THEN 1 ELSE 0 END) AS SOLD_COUNT
      FROM TICKETS TK
      WHERE TK.TICKET_TRIP = HEXTORAW(:tripId)
    `;
    const ticketsResult = await db.execute(ticketsSql, { tripId: hex });
    const ticketStats = ticketsResult.rows[0] || {};

    const baggageSql = `
      SELECT COUNT(B.BAGGAGE_ID) AS BAGGAGE_COUNT
      FROM BAGGAGE B
      JOIN USERS_TICKETS UT ON B.BAGGAGE_UT_HASH = UT.UT_HASH
      JOIN TICKETS TK ON UT.UT_TICKET = TK.TICKET_ID
      WHERE TK.TICKET_TRIP = HEXTORAW(:tripId)
    `;
    const baggageResult = await db.execute(baggageSql, { tripId: hex });
    const baggageStats = baggageResult.rows[0] || {};

    return {
      tripId: trip.tripId,
      departure: trip.tripDeparture,
      arrival: trip.tripArrival,
      tripDate: trip.tripDate,
      tripTickets: trip.tripTickets,
      tripOccupation: trip.tripOccupation,
      totalTicketsCount: Number(ticketStats.TOTAL_TICKETS || 0),
      boardedCount: Number(ticketStats.BOARDED_COUNT || 0),
      soldCount: Number(ticketStats.SOLD_COUNT || 0),
      baggageCount: Number(baggageStats.BAGGAGE_COUNT || 0),
    };
  }

  /**
   * Insere uma nova viagem
   * @param {object} trip
   * @param {object} [connection]
   */
  async create(trip, connection = null) {
    const tripId = trip.tripId ? rawHelper.normalizeRaw16(trip.tripId).hex : rawHelper.generateRaw16().hex;
    const driverId = rawHelper.normalizeRaw16(trip.tripDriver).hex;

    const sql = `
      INSERT INTO TRIPS (
        TRIP_ID,
        TRIP_DATE,
        TRIP_DEPARTURE,
        TRIP_ARRIVAL,
        TRIP_TICKETS,
        TRIP_OCUPATION,
        TRIP_DRIVER
      ) VALUES (
        HEXTORAW(:tripId),
        :tripDate,
        :tripDeparture,
        :tripArrival,
        :tripTickets,
        :tripOccupation,
        HEXTORAW(:tripDriver)
      )
    `;

    const binds = {
      tripId,
      tripDate: trip.tripDate instanceof Date ? trip.tripDate : new Date(trip.tripDate),
      tripDeparture: trip.tripDeparture,
      tripArrival: trip.tripArrival,
      tripTickets: Number(trip.tripTickets || 0),
      tripOccupation: String(trip.tripOccupation || '0%'),
      tripDriver: driverId,
    };

    if (connection) {
      await connection.execute(sql, binds);
    } else {
      await db.execute(sql, binds, { autoCommit: true });
    }

    return {
      tripId,
      tripDate: binds.tripDate,
      tripDeparture: binds.tripDeparture,
      tripArrival: binds.tripArrival,
      tripTickets: binds.tripTickets,
      tripOccupation: binds.tripOccupation,
      tripDriver: binds.tripDriver,
    };
  }

  _mapTrip(row) {
    return {
      tripId: row.TRIP_ID,
      tripDate: row.TRIP_DATE,
      tripDeparture: row.TRIP_DEPARTURE,
      tripArrival: row.TRIP_ARRIVAL,
      tripTickets: Number(row.TRIP_TICKETS),
      tripOccupation: row.TRIP_OCUPATION,
      tripDriver: row.TRIP_DRIVER,
      driverName: row.DRIVER_NAME || null,
    };
  }
}

module.exports = new TripRepository();