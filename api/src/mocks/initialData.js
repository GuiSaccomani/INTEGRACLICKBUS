const db = {
  // Guarda qual viagem está emitindo sinal NFC no momento
  activeNfcBroadcast: null, // Exemplo quando ativo: { driverId: "DRIVER-1", tripId: "TRIP-101" }

  trips: [
    {
      id: "TRIP-101",
      driverId: "DRIVER-1",
      origin: "São Paulo",
      destination: "Rio de Janeiro",
      date: "2026-09-01",
      time: "14:00",
      platform: "04"
    }
  ],
  tickets: [
    {
      id: "TICKET-789",
      tripId: "TRIP-101",
      passengerName: "João Silva",
      seat: "12A",
      serviceClass: "VIP",
      company: "Viação Exemplo",
      status: "PENDING"
    }
  ],
  luggages: [
    { id: "LUG-001", ticketId: "TICKET-789", status: "UNCHECKED" },
    { id: "LUG-002", ticketId: "TICKET-789", status: "UNCHECKED" }
  ]
};

module.exports = db;