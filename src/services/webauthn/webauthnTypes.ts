/**
 * Tipos e estados oficiais da integração WebAuthn / Passkeys / Biometria do ÍNTEGRA
 */

export type BiometricSupportStatus =
  | 'unsupported'      // Navegador ou contexto não suporta WebAuthn
  | 'supported'        // WebAuthn suportado pelo navegador
  | 'available';       // Autenticador de plataforma (Touch ID, Face ID, Windows Hello) disponível

export type BiometricRegistrationStatus =
  | 'registered'       // Usuário possui biometria cadastrada neste dispositivo/conta
  | 'notRegistered';   // Usuário não possui biometria cadastrada

export type BiometricOperationState =
  | 'idle'             // Em repouso
  | 'authenticating'   // Diálogo nativo de autenticação aberto no dispositivo
  | 'registering'      // Diálogo nativo de registro de biometria aberto
  | 'success'          // Validação confirmada pelo backend
  | 'cancelled'        // Usuário cancelou ou fechou o prompt do sistema
  | 'error';           // Erro de validação ou de rede

export interface BiometricDeviceInfo {
  credentialId: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

export interface BiometricStatusResponse {
  registered: boolean;
  credentialsCount: number;
  credentials: BiometricDeviceInfo[];
}

export interface BiometricAuthResult {
  success: boolean;
  cancelled?: boolean;
  message: string;
  user?: any;
}
