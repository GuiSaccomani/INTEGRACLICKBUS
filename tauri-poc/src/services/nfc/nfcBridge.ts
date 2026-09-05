import { nfcStateMachine, NfcErrorCode } from "./nfcStateMachine";
import { formatBaggageNdefPayload, parseBaggageNdefPayload, BaggageTagData } from "./nfcParser";
import { nfcService } from "./nfcService";

/**
 * Utilitário para verificar se o código está executando no ambiente Tauri 2
 */
export function isTauriEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as any).__TAURI_INTERNALS__ ||
    (window as any).__TAURI__
  );
}

export interface HardwareNfcSupport {
  isSupported: boolean;
  isEnabled: boolean;
  hasHce: boolean;
  hasReaderMode: boolean;
  source: "tauri-android" | "web-ndef" | "none";
  message: string;
}

export interface NfcReadResult {
  physicalUid: string;       // UID físico do silício da tag NFC (ISO/IEC 14443-3A)
  baggageId: string;         // BAGGAGE_ID RAW(32) lógico da aplicação ÍNTEGRA
  version: number;
  readAt: string;
  source: "tauri-native" | "web-nfc";
}

export interface NfcHceResult {
  credentialRef: string;
  passengerId: string;
  timestamp: number;
  status: "TRANSFERRED" | "VALIDATED" | "REJECTED";
}

/**
 * Ponte de integração NFC da POC Tauri 2 — ÍNTEGRA
 * Desacopla o frontend React da implementação de baixo nível
 */
class NfcBridge {
  /**
   * Helper para invocar comandos Rust do Tauri com fallback seguro
   */
  private async invokeTauri<T>(command: string, args?: Record<string, any>): Promise<T> {
    if (!isTauriEnvironment()) {
      throw new Error("Ambiente Tauri não detectado.");
    }
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<T>(command, args);
  }

  /**
   * Verifica o suporte de hardware e permissões NFC do dispositivo
   */
  public async checkSupport(): Promise<HardwareNfcSupport> {
    // 1. Caso esteja executando no Tauri Android
    if (isTauriEnvironment()) {
      try {
        const nativeSupport = await this.invokeTauri<{
          supported: boolean;
          enabled: boolean;
          hce: boolean;
          readerMode: boolean;
        }>("check_nfc_support");

        return {
          isSupported: nativeSupport.supported,
          isEnabled: nativeSupport.enabled,
          hasHce: nativeSupport.hce,
          hasReaderMode: nativeSupport.readerMode,
          source: "tauri-android",
          message: nativeSupport.enabled
            ? "NFC nativo Android ativo (HCE e Reader Mode disponíveis)."
            : "NFC nativo desativado nas configurações do Android.",
        };
      } catch (err: any) {
        return {
          isSupported: false,
          isEnabled: false,
          hasHce: false,
          hasReaderMode: false,
          source: "tauri-android",
          message: `Erro ao consultar NFC nativo Tauri: ${err.message || err}`,
        };
      }
    }

    // 2. Caso esteja em navegador Web padrão
    const webSupport = nfcService.checkSupport();
    return {
      isSupported: webSupport.isSupported,
      isEnabled: webSupport.isSupported,
      hasHce: false, // W3C Web NFC NÃO suporta HCE
      hasReaderMode: webSupport.canRead,
      source: webSupport.isSupported ? "web-ndef" : "none",
      message: webSupport.message,
    };
  }

  /**
   * Leitura de Tag Física de Bagagem (NDEF)
   * Garante a diferenciação: physicalUid != baggageId
   */
  public async readBaggageTag(timeoutMs: number = 30000): Promise<NfcReadResult> {
    const signal = nfcStateMachine.startOperation("READ_BAGGAGE", timeoutMs);

    try {
      const support = await this.checkSupport();
      if (!support.isSupported) {
        throw { code: "HARDWARE_UNAVAILABLE" as NfcErrorCode, message: support.message };
      }
      if (!support.isEnabled) {
        throw { code: "NFC_DISABLED" as NfcErrorCode, message: "Habilite o NFC nas configurações do aparelho." };
      }

      nfcStateMachine.toWaiting("Aproxime a tag NFC física da bagagem da traseira do aparelho...");

      // Execução no Tauri Android Nativo
      if (support.source === "tauri-android") {
        nfcStateMachine.toReading();
        const nativeResult = await this.invokeTauri<{
          tagUid: string;
          payload: string;
        }>("read_nfc_baggage_tag", { timeoutMs });

        // Validação rigorosa do payload da tag
        const parsed = parseBaggageNdefPayload(nativeResult.payload, nativeResult.tagUid);
        if (!parsed || !parsed.baggageId) {
          throw { code: "INVALID_PAYLOAD" as NfcErrorCode, message: "Tag lida, mas payload não possui formato ÍNTEGRA válido." };
        }

        const result: NfcReadResult = {
          physicalUid: nativeResult.tagUid,
          baggageId: parsed.baggageId,
          version: parsed.version || 1,
          readAt: new Date().toISOString(),
          source: "tauri-native",
        };

        nfcStateMachine.success(result, `Bagagem lida com sucesso! Tag UID: ${result.physicalUid}`);
        return result;
      }

      // Fallback para Web NFC (navegador Chrome Android)
      return await new Promise<NfcReadResult>((resolve, reject) => {
        nfcService.scan({
          signal,
          onBaggageRead: (baggageData: BaggageTagData) => {
            const result: NfcReadResult = {
              physicalUid: baggageData.tagUid,
              baggageId: baggageData.baggageId,
              version: baggageData.version,
              readAt: new Date().toISOString(),
              source: "web-nfc",
            };
            nfcStateMachine.success(result, `Bagagem lida via Web NFC. Tag UID: ${result.physicalUid}`);
            resolve(result);
          },
          onError: (err) => {
            nfcStateMachine.fail("TAG_INCOMPATIBLE", err.message);
            reject(err);
          },
        }).catch((err) => {
          nfcStateMachine.fail("UNKNOWN_ERROR", err.message);
          reject(err);
        });
      });
    } catch (err: any) {
      const code = err.code || "UNKNOWN_ERROR";
      const msg = err.message || "Falha na leitura da tag NFC.";
      nfcStateMachine.fail(code, msg);
      throw err;
    }
  }

  /**
   * Gravação de identificador de bagagem (BAGGAGE_ID RAW 32) na tag física
   */
  public async writeBaggageTag(baggageId: string, timeoutMs: number = 30000): Promise<{ physicalUid?: string; payload: string }> {
    if (!baggageId || baggageId.trim().length === 0) {
      throw new Error("BAGGAGE_ID inválido para gravação na tag NFC.");
    }

    const signal = nfcStateMachine.startOperation("WRITE_BAGGAGE", timeoutMs);

    try {
      const support = await this.checkSupport();
      if (!support.isSupported) {
        throw { code: "HARDWARE_UNAVAILABLE" as NfcErrorCode, message: support.message };
      }

      nfcStateMachine.toWaiting("Aproxime a tag física virgem para gravar...");

      const payload = formatBaggageNdefPayload(baggageId);

      if (support.source === "tauri-android") {
        nfcStateMachine.toWriting();
        const nativeRes = await this.invokeTauri<{ tagUid: string; success: boolean }>("write_nfc_baggage_tag", {
          payload,
          timeoutMs,
        });

        nfcStateMachine.success(nativeRes, "Tag NFC de bagagem gravada com sucesso!");
        return { physicalUid: nativeRes.tagUid, payload };
      }

      // Fallback Web NFC
      nfcStateMachine.toWriting();
      await nfcService.writeBaggageTag(baggageId, signal);
      nfcStateMachine.success({ payload }, "Tag de bagagem gravada via Web NFC com sucesso!");
      return { payload };
    } catch (err: any) {
      const code = err.code || "UNKNOWN_ERROR";
      const msg = err.message || "Falha na gravação da tag NFC.";
      nfcStateMachine.fail(code, msg);
      throw err;
    }
  }

  /**
   * Ativa a emulação de cartão no celular do passageiro (Host Card Emulation - HCE)
   * Exclusivo para Android Nativo / Tauri 2. Incompatível com navegadores web convencionais.
   */
  public async startPassengerHce(credentialRef: string): Promise<void> {
    nfcStateMachine.startOperation("HCE_PASSENGER", 60000);

    if (!isTauriEnvironment()) {
      nfcStateMachine.fail(
        "UNSUPPORTED_ENVIRONMENT",
        "Host Card Emulation (HCE) não é suportado no navegador Web. Utilize a apresentação de QR Code como fallback oficial."
      );
      throw new Error("HCE requer ambiente Tauri 2 Android nativo.");
    }

    try {
      nfcStateMachine.toWaiting("Aproxime a traseira deste celular do aparelho do motorista...");
      await this.invokeTauri("start_hce_passenger", { credentialRef });
    } catch (err: any) {
      nfcStateMachine.fail("HARDWARE_UNAVAILABLE", `Erro ao ativar HCE: ${err.message || err}`);
      throw err;
    }
  }

  /**
   * Desativa o HCE no celular do passageiro
   */
  public async stopPassengerHce(): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        await this.invokeTauri("stop_hce_passenger");
      } catch (err) {
        console.warn("[NfcBridge] Erro ao desativar HCE:", err);
      }
    }
    nfcStateMachine.reset();
  }

  /**
   * Ativa o Reader Mode no celular do motorista para ler o HCE do passageiro
   * Envia comando APDU SELECT AID F0494E5445475241
   */
  public async startDriverReaderMode(timeoutMs: number = 30000): Promise<NfcHceResult> {
    nfcStateMachine.startOperation("READER_DRIVER", timeoutMs);

    if (!isTauriEnvironment()) {
      nfcStateMachine.fail(
        "UNSUPPORTED_ENVIRONMENT",
        "Reader Mode IsoDep celular a celular não é suportado no navegador Web. Utilize o leitor de QR Code pela câmera."
      );
      throw new Error("Reader Mode celular a celular requer ambiente Tauri 2 Android.");
    }

    try {
      nfcStateMachine.toWaiting("Aproxime a traseira do aparelho do motorista do celular do passageiro...");
      const result = await this.invokeTauri<NfcHceResult>("start_driver_reader_mode", { timeoutMs });

      nfcStateMachine.toProcessing("Credencial recebida via NFC. Consultando API ÍNTEGRA...");
      return result;
    } catch (err: any) {
      nfcStateMachine.fail("TIMEOUT", err.message || "Nenhum dispositivo com HCE aproximado dentro do tempo limite.");
      throw err;
    }
  }
}

export const nfcBridge = new NfcBridge();
