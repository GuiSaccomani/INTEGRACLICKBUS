/**
 * Cliente de integração HTTP da aplicação React Web com a API Node/Express do ÍNTEGRA.
 * O React Web NUNCA acessa o banco Oracle diretamente; todas as operações trafegam por esta API.
 */

function getApiBaseUrl(): string {
  const env = (import.meta as any).env;
  if (env && env.VITE_API_URL) {
    return env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3333';
    }
    if (host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) {
      return `http://${host}:3333`;
    }
  }
  // API oficial em produção no Render
  return 'https://integraclickbus.onrender.com';
}

const API_BASE_URL = getApiBaseUrl();

export interface UserRole {
  isPassenger: boolean;
  isDriver: boolean;
  isOperator: boolean;
}

export interface UserProfile {
  userId: string;
  userName: string;
  userEmail: string;
  roles: UserRole;
}

export interface TicketDetails {
  ticketId: string;
  tripId: string;
  passengerName: string;
  passengerEmail?: string;
  seat: number;
  departure: string;
  arrival: string;
  tripDate: string;
  sold: number;
  used: number;
  utHash?: string;
  transitCardId?: string;
}

export interface BaggageItem {
  baggageId: string;
  baggageUtHash: string;
}

export interface ValidatedTicketResult {
  validated: boolean;
  ticketId: string;
  passengerName: string;
  seat: number;
  departure: string;
  arrival: string;
  used: number;
  luggagesCount: number;
  luggagesDetails?: { baggageId: string; baggageUtHash: string }[];
}

export interface LuggageDetail {
  baggageId: string;
  baggageUtHash: string;
  ticketId: string;
  userId: string;
  passengerName: string;
  seat: number;
  departure: string;
  arrival: string;
  tripDate: string;
}

export interface TicketResponse {
  ticket: TicketDetails;
  luggages: BaggageItem[];
}

export interface TripPassenger {
  ticketId: string;
  seat: number;
  passengerName: string;
  passengerEmail?: string;
  status: string;
  isBoarded: boolean;
  baggageCount: number;
  hasBaggage: boolean;
}

export interface TripSummary {
  tripId: string;
  departure: string;
  arrival: string;
  tripDate: string;
  tripTickets: number;
  tripOccupation: string;
  totalTicketsCount: number;
  boardedCount: number;
  soldCount: number;
  baggageCount: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Verificação de conectividade offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const offlineErr = new Error('Sem conexão com a internet. Não foi possível conectar ao servidor.');
    (offlineErr as any).isOffline = true;
    throw offlineErr;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netError: any) {
    // Erro de rede ou indisponibilidade de servidor
    const err = new Error('Sem conexão com a internet. Não foi possível conectar ao servidor.');
    (err as any).originalError = netError;
    (err as any).isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    throw err;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Erro HTTP ${response.status}: ${response.statusText}`;
    const err = new Error(errorMsg);
    (err as any).status = response.status;
    (err as any).data = data;
    throw err;
  }

  return data as T;
}

// ─── AUTHENTICATION ──────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string): Promise<{ message: string; user: UserProfile }> => {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async (userId: string): Promise<UserProfile> => {
    return request(`/auth/profile/${userId}`);
  },

  // WebAuthn / Passkeys
  getWebauthnRegisterOptions: async (userId: string) => {
    return request('/auth/webauthn/register/options', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  verifyWebauthnRegister: async (userId: string, response: any) => {
    return request('/auth/webauthn/register/verify', {
      method: 'POST',
      body: JSON.stringify({ userId, response }),
    });
  },

  getWebauthnLoginOptions: async (email?: string) => {
    return request('/auth/webauthn/login/options', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyWebauthnLogin: async (response: any, challengeKey?: string) => {
    return request<{ verified: boolean; message: string; user: UserProfile }>('/auth/webauthn/login/verify', {
      method: 'POST',
      body: JSON.stringify({ response, challengeKey }),
    });
  },

  getWebauthnStatus: async (userId: string) => {
    return request<{ registered: boolean; credentialsCount: number; credentials: any[] }>(`/auth/webauthn/status/${userId}`);
  },

  removeWebauthnCredential: async (credentialId: string, userId?: string) => {
    return request(`/auth/webauthn/credentials/${credentialId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  },
};


// ─── PASSENGER & TICKETS ─────────────────────────────────────────────────────
export const passengerApi = {
  getTicket: async (ticketId: string): Promise<TicketResponse> => {
    return request(`/passenger/ticket/${ticketId}`);
  },

  getUserTickets: async (userId: string): Promise<TicketDetails[]> => {
    return request(`/passenger/user/${userId}/tickets`);
  },

  validateTicket: async (ticketId: string, driverId?: string): Promise<{ message: string; data: ValidatedTicketResult }> => {
    return request(`/passenger/ticket/${ticketId}/validate`, {
      method: 'POST',
      body: JSON.stringify({ driverId }),
    });
  },

  validateCredential: async (credentialRef: string, driverId?: string): Promise<{ message: string; data: ValidatedTicketResult }> => {
    return request(`/passenger/credential/validate`, {
      method: 'POST',
      body: JSON.stringify({ credentialRef, driverId }),
    });
  },

  // Mantém retrocompatibilidade com scan NFC
  scanNfc: async (ticketId: string) => {
    return request('/passenger/nfc/scan', {
      method: 'POST',
      body: JSON.stringify({ ticketId }),
    });
  },
};

// ─── DRIVER & TRIPS ──────────────────────────────────────────────────────────
export const driverApi = {
  getTrips: async (driverId: string): Promise<{ trips: any[] }> => {
    return request(`/driver/${driverId}/trips`);
  },

  getTripPassengers: async (tripId: string): Promise<{ passengers: TripPassenger[] }> => {
    return request(`/driver/trip/${tripId}/passengers`);
  },

  getTripSummary: async (tripId: string): Promise<TripSummary> => {
    return request(`/driver/trip/${tripId}/summary`);
  },

  startBroadcast: async (driverId: string) => {
    return request('/driver/nfc/start', {
      method: 'POST',
      body: JSON.stringify({ driverId }),
    });
  },

  stopBroadcast: async () => {
    return request('/driver/nfc/stop', {
      method: 'POST',
    });
  },
};

// ─── BAGGAGE ─────────────────────────────────────────────────────────────────
export const luggageApi = {
  addLuggage: async (ticketId: string, baggageId?: string) => {
    return request('/luggages', {
      method: 'POST',
      body: JSON.stringify({ ticketId, baggageId }),
    });
  },

  getByTicket: async (ticketId: string): Promise<{ luggages: BaggageItem[] }> => {
    return request(`/luggages/ticket/${ticketId}`);
  },

  getById: async (baggageId: string): Promise<{ luggage: LuggageDetail }> => {
    return request(`/luggages/${baggageId}`);
  },

  removeLuggage: async (baggageId: string) => {
    return request(`/luggages/${baggageId}`, {
      method: 'DELETE',
    });
  },
};

// ─── HEALTH ──────────────────────────────────────────────────────────────────
export const healthApi = {
  check: async () => {
    return request<{ status: string; service: string }>('/health');
  },

  checkDb: async () => {
    return request<{ status: string; database: string }>('/health/db');
  },
};
