import { BaggageNfcData, CredentialNfcData } from "./nfcTypes";

/**
 * Utilitário de parsing e formatação para payloads NDEF do projeto ÍNTEGRA.
 * 
 * Padrões de payload estruturado:
 * - Bagagem: "integra:baggage:v1:<baggageId>"
 * - Credencial: "integra:credential:v1:<credentialRef>"
 */

export const NFC_PAYLOAD_PREFIX = {
  BAGGAGE: "integra:baggage:v1:",
  CREDENTIAL: "integra:credential:v1:",
};

/**
 * Formata o identificador de bagagem (BAGGAGE_ID RAW(32)) para gravação NDEF.
 * @param baggageId - Hexadecimal de até 64 caracteres
 */
export function formatBaggageNdefPayload(baggageId: string): string {
  if (!baggageId || typeof baggageId !== "string") {
    throw new Error("Identificador de bagagem inválido para formatação NDEF.");
  }
  const cleanId = baggageId.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
  return `${NFC_PAYLOAD_PREFIX.BAGGAGE}${cleanId}`;
}

/**
 * Realiza o parsing do texto lido da tag NDEF para objeto BaggageNfcData.
 * @param textPayload - Conteúdo texto lido da tag
 * @param serialNumber - UID físico da tag retornado pelo hardware
 */
export function parseBaggageNdefPayload(textPayload: string, serialNumber?: string): BaggageNfcData | null {
  if (!textPayload || typeof textPayload !== "string") return null;

  const trimmed = textPayload.trim();
  if (!trimmed.startsWith(NFC_PAYLOAD_PREFIX.BAGGAGE)) {
    // Tenta verificar se o payload foi gravado diretamente como hex de 64 chars
    const hexOnly = trimmed.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
    if (hexOnly.length === 64) {
      return {
        version: 1,
        baggageId: hexOnly,
        tagPhysicalUid: serialNumber || undefined,
        rawPayload: trimmed,
        timestamp: Date.now(),
      };
    }
    return null;
  }

  const rawId = trimmed.slice(NFC_PAYLOAD_PREFIX.BAGGAGE.length);
  const cleanBaggageId = rawId.replace(/[^a-fA-F0-9]/g, "").toUpperCase();

  if (cleanBaggageId.length === 0) return null;

  return {
    version: 1,
    baggageId: cleanBaggageId,
    tagPhysicalUid: serialNumber || undefined,
    rawPayload: trimmed,
    timestamp: Date.now(),
  };
}

/**
 * Formata a referência da credencial do passageiro (UT_HASH ou TicketId) para gravação NDEF.
 */
export function formatCredentialNdefPayload(credentialRef: string): string {
  if (!credentialRef || typeof credentialRef !== "string") {
    throw new Error("Referência da credencial inválida para formatação NDEF.");
  }
  const cleanRef = credentialRef.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
  return `${NFC_PAYLOAD_PREFIX.CREDENTIAL}${cleanRef}`;
}

/**
 * Realiza o parsing de credencial de passageiro transportada em tag física NDEF.
 */
export function parseCredentialNdefPayload(textPayload: string, serialNumber?: string): CredentialNfcData | null {
  if (!textPayload || typeof textPayload !== "string") return null;

  const trimmed = textPayload.trim();
  if (!trimmed.startsWith(NFC_PAYLOAD_PREFIX.CREDENTIAL)) {
    const hexOnly = trimmed.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
    if (hexOnly.length === 64 || hexOnly.length === 32) {
      return {
        version: 1,
        credentialRef: hexOnly,
        tagPhysicalUid: serialNumber || undefined,
        rawPayload: trimmed,
        timestamp: Date.now(),
      };
    }
    return null;
  }

  const rawRef = trimmed.slice(NFC_PAYLOAD_PREFIX.CREDENTIAL.length);
  const cleanRef = rawRef.replace(/[^a-fA-F0-9]/g, "").toUpperCase();

  if (cleanRef.length === 0) return null;

  return {
    version: 1,
    credentialRef: cleanRef,
    tagPhysicalUid: serialNumber || undefined,
    rawPayload: trimmed,
    timestamp: Date.now(),
  };
}

/**
 * Extrai o texto contido em registros NDEF lidos pela Web NFC API.
 */
export function extractTextFromNdefRecord(record: any): string | null {
  try {
    if (!record) return null;

    // Record do tipo text nativo da Web NFC
    if (record.recordType === "text") {
      const textDecoder = new TextDecoder(record.encoding || "utf-8");
      return textDecoder.decode(record.data);
    }

    // Record do tipo mime json ou texto puro
    if (record.recordType === "mime" || record.recordType === "unknown") {
      const textDecoder = new TextDecoder();
      return textDecoder.decode(record.data);
    }

    // Se record.data for ArrayBuffer ou DataView
    if (record.data) {
      const textDecoder = new TextDecoder();
      return textDecoder.decode(record.data);
    }
  } catch (err) {
    console.warn("⚠️ [nfcParser] Falha ao decodificar registro NDEF:", err);
  }

  return null;
}
