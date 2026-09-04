const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const driverService = require('../src/services/driverService');
const userRepository = require('../src/repositories/userRepository');
const tripRepository = require('../src/repositories/tripRepository');
const ticketRepository = require('../src/repositories/ticketRepository');
const luggageRepository = require('../src/repositories/luggageRepository');

describe('DriverService - Viagens, Passageiros e Permissões do Motorista', () => {
  it('deve rejeitar com 403 se o usuário tentar acessar fluxos de motorista sem ter USER_DRIVER = 1', async () => {
    const origFindUser = userRepository.findById;

    userRepository.findById = async () => ({
      userId: 'A0EEBC999C0B4EF8BB6D6BB9BD380A11',
      userName: 'Passageiro Comum',
      userPassanger: 1,
      userDriver: 0, // NÃO é motorista
    });

    try {
      await assert.rejects(
        async () => {
          await driverService.getDriverTrips('A0EEBC999C0B4EF8BB6D6BB9BD380A11');
        },
        (err) => {
          assert.equal(err.status, 403);
          assert.match(err.message, /perfil de motorista/);
          return true;
        }
      );
    } finally {
      userRepository.findById = origFindUser;
    }
  });

  it('deve listar viagens do motorista quando usuário possui USER_DRIVER = 1', async () => {
    const origFindUser = userRepository.findById;
    const origFindTrips = tripRepository.findByDriverId;

    userRepository.findById = async () => ({
      userId: 'A0EEBC999C0B4EF8BB6D6BB9BD380A11',
      userName: 'Motorista Oficial',
      userDriver: 1,
    });

    tripRepository.findByDriverId = async () => [
      {
        tripId: 'T1T2T3T4T5T60102030405060708090A',
        tripDeparture: 'São Paulo',
        tripArrival: 'Curitiba',
        tripTickets: 42,
        tripOccupation: '85%',
      }
    ];

    try {
      const trips = await driverService.getDriverTrips('A0EEBC999C0B4EF8BB6D6BB9BD380A11');
      assert.equal(trips.length, 1);
      assert.equal(trips[0].tripDeparture, 'São Paulo');
      assert.equal(trips[0].tripArrival, 'Curitiba');
    } finally {
      userRepository.findById = origFindUser;
      tripRepository.findByDriverId = origFindTrips;
    }
  });

  it('deve obter passageiros da viagem com status derivado de TICKET_USED', async () => {
    const origFindTrip = tripRepository.findById;
    const origFindPassengers = ticketRepository.findPassengersByTripId;
    const origFindLuggage = luggageRepository.findByUtHash;

    tripRepository.findById = async () => ({
      tripId: 'T1T2T3T4T5T60102030405060708090A',
    });

    ticketRepository.findPassengersByTripId = async () => [
      {
        ticketId: 'TK1',
        seat: 10,
        sold: 1,
        used: 1, // Embarcado
        passengerName: 'Marcos Santos',
        utHash: 'H1',
      },
      {
        ticketId: 'TK2',
        seat: 11,
        sold: 1,
        used: 0, // Aguardando
        passengerName: 'Carla Dias',
        utHash: 'H2',
      }
    ];

    luggageRepository.findByUtHash = async () => [];

    try {
      const passengers = await driverService.getTripPassengers('T1T2T3T4T5T60102030405060708090A');
      assert.equal(passengers.length, 2);
      assert.equal(passengers[0].status, 'Embarcado');
      assert.equal(passengers[0].isBoarded, true);
      assert.equal(passengers[1].status, 'Aguardando embarque');
      assert.equal(passengers[1].isBoarded, false);
    } finally {
      tripRepository.findById = origFindTrip;
      ticketRepository.findPassengersByTripId = origFindPassengers;
      luggageRepository.findByUtHash = origFindLuggage;
    }
  });
});
