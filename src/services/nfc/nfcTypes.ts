/**
 * Tipos e interfaces padronizadas para a camada Web NFC do projeto ÍNTEGRA.
 * Respeita a especificação W3C Web NFC e o schema oficial Oracle.
 */

export type NfcState =
  | 'IDLE'
  | 'CHECKING_SUPPORT'
  | 'UNSUPPORTED'
  | 'WAITING_FOR_TAG'
  | 'READING'
  | 'WRITING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR';

/**
 * Informações sobre o suporte técnico do navegador/dispositivo ao Web NFC.
 */
export interface NfcSupportInfo {
  isSupported: boolean;
  canRead: boolean;
  canWrite: boolean;
  deviceType: 'android-chrome' | 'ios' | 'desktop' | 'unsupported-browser';
  message: string;
}

/**
 * Dados de bagagem codificados na tag NFC física (NDEF).
 * IMPORTANTE: O tagPhysicalUid é o UID de hardware da tag e NÃO substitui o BAGGAGE_ID.
 */
export interface BaggageNfcData {
  version: number;
  baggageId: string; // BAGGAGE_ID no Oracle (RAW(32) - 64 caracteres hexadecimais)
  tagPhysicalUid?: string; // Serial number físico do chip NFC (ex: 04:A1:B2...)
  rawPayload: string;
  timestamp: number;
}

/**
 * Dados de credencial de embarque quando transportados em tag física.
 */
export interface CredentialNfcData {
  version: number;
  credentialRef: string; // UT_HASH (64 hex chars) ou TicketId (32 hex chars)
  tagPhysicalUid?: string;
  rawPayload: string;
  timestamp: number;
}

/**
 * Opções para varredura e escuta NDEF
 */
export interface ScanOptions {
  onBaggageRead?: (data: BaggageNfcData) => void;
  onCredentialRead?: (data: CredentialNfcData) => void;
  onRawRead?: (serialNumber: string, records: any[]) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}
