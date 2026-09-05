import { NfcSupportInfo, ScanOptions } from "./nfcTypes";
import {
  formatBaggageNdefPayload,
  parseBaggageNdefPayload,
  parseCredentialNdefPayload,
  extractTextFromNdefRecord,
} from "./nfcParser";

/**
 * Serviço isolado para manipulação de Web NFC (W3C NDEFReader API).
 * 
 * LIMITAÇÃO DOCUMENTADA:
 * - A API Web NFC no navegador suporta apenas leitura e escrita de TAGS PASSIVAS (Reader/Writer mode).
 * - A API Web NÃO suporta Host Card Emulation (HCE) nem P2P mode (comunicação direta celular ↔ celular no browser).
 * - No Web, o fluxo de leitura/escrita de tags físicas é utilizado para o rastreamento de BAGAGENS.
 * - Para o embarque de PASSAGEIRO no Web, o QR Code é o fallback primário garantido.
 */
class NfcService {
  /**
   * Verifica o suporte do dispositivo e navegador ao Web NFC.
   */
  public checkSupport(): NfcSupportInfo {
    if (typeof window === "undefined") {
      return {
        isSupported: false,
        canRead: false,
        canWrite: false,
        deviceType: "unsupported-browser",
        message: "Ambiente não suporta Web NFC (SSR).",
      };
    }

    const hasNdef = "NDEFReader" in window;
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/i.test(ua);
    const isChrome = /Chrome/i.test(ua) && !/Edg/i.test(ua);

    if (isIOS) {
      return {
        isSupported: false,
        canRead: false,
        canWrite: false,
        deviceType: "ios",
        message: "O iOS não permite Web NFC no navegador (limitação do sistema operacional). Utilize validação por QR Code.",
      };
    }

    if (!hasNdef) {
      if (!isAndroid) {
        return {
          isSupported: false,
          canRead: false,
          canWrite: false,
          deviceType: "desktop",
          message: "Navegador de computador não possui hardware NFC habilitado. Utilize QR Code.",
        };
      }
      return {
        isSupported: false,
        canRead: false,
        canWrite: false,
        deviceType: "unsupported-browser",
        message: "Este navegador não suporta Web NFC. Para utilizar tags NFC, abra no Chrome para Android.",
      };
    }

    return {
      isSupported: true,
      canRead: true,
      canWrite: true,
      deviceType: isAndroid && isChrome ? "android-chrome" : "unsupported-browser",
      message: "Web NFC suportado para leitura e escrita de tags NDEF físicas.",
    };
  }

  /**
   * Inicia a escuta ativa de tags físicas NDEF via Web NFC.
   */
  public async scan(options: ScanOptions): Promise<void> {
    const support = this.checkSupport();
    if (!support.isSupported) {
      const err = new Error(support.message);
      options.onError?.(err);
      throw err;
    }

    try {
      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();

      await ndef.scan({ signal: options.signal });

      ndef.onreading = (event: any) => {
        const serialNumber = event.serialNumber || "";
        const records = event.message?.records || [];

        if (options.onRawRead) {
          options.onRawRead(serialNumber, records);
        }

        for (const record of records) {
          const text = extractTextFromNdefRecord(record);
          if (!text) continue;

          // 1. Tenta identificar se é payload de bagagem
          const baggageData = parseBaggageNdefPayload(text, serialNumber);
          if (baggageData && options.onBaggageRead) {
            options.onBaggageRead(baggageData);
            return;
          }

          // 2. Tenta identificar se é payload de credencial
          const credentialData = parseCredentialNdefPayload(text, serialNumber);
          if (credentialData && options.onCredentialRead) {
            options.onCredentialRead(credentialData);
            return;
          }
        }

        // Se encontrou records mas não decodificou padrão conhecido
        if (records.length > 0 && options.onError) {
          options.onError(new Error("Tag NFC física lida, mas o formato não corresponde a um registro ÍNTEGRA válido."));
        }
      };

      ndef.onreadingerror = (ev: any) => {
        const err = new Error("Erro na leitura física da tag NFC. Mantenha o dispositivo imóvel e próximo à tag.");
        options.onError?.(err);
      };
    } catch (error: any) {
      options.onError?.(error);
      throw error;
    }
  }

  /**
   * Grava o identificador de bagagem (BAGGAGE_ID RAW(32)) em uma tag física NDEF.
   * Não grava dados sensíveis nem dados pessoais.
   */
  public async writeBaggageTag(baggageId: string, signal?: AbortSignal): Promise<{ success: boolean; payload: string }> {
    const support = this.checkSupport();
    if (!support.isSupported) {
      throw new Error(support.message);
    }

    const payload = formatBaggageNdefPayload(baggageId);
    const NDEFReaderClass = (window as any).NDEFReader;
    const ndef = new NDEFReaderClass();

    await ndef.write(
      {
        records: [
          {
            recordType: "text",
            data: payload,
          },
        ],
      },
      { overwrite: true, signal }
    );

    return { success: true, payload };
  }

  /**
   * Limpa fisicamente uma tag NDEF de bagagem, removendo os dados para que a tag possa ser reutilizada.
   */
  public async clearTag(signal?: AbortSignal): Promise<{ success: boolean }> {
    const support = this.checkSupport();
    if (!support.isSupported) {
      throw new Error(support.message);
    }

    const NDEFReaderClass = (window as any).NDEFReader;
    const ndef = new NDEFReaderClass();

    // Sobrescreve com registro vazio estruturado
    await ndef.write(
      {
        records: [
          {
            recordType: "text",
            data: "integra:empty",
          },
        ],
      },
      { overwrite: true, signal }
    );

    return { success: true };
  }
}

export const nfcService = new NfcService();
