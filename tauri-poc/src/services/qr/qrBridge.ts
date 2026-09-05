import QRCode from "qrcode";
import { isTauriEnvironment } from "../nfc/nfcBridge";

export interface QrGenerationOptions {
  width?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
}

export interface QrScanResult {
  text: string;
  format?: string;
  source: "tauri-native-scanner" | "webview-html5-camera";
}

/**
 * Ponte isolada para geração e leitura de QR Code na POC Tauri 2 — ÍNTEGRA
 */
class QrBridge {
  /**
   * CENÁRIO 1: PASSAGEIRO — Geração e Exibição de QR Code
   * Renderiza SVG/DataURL diretamente via Canvas no WebView.
   * Totalmente compatível no WebView do Tauri Android sem necessidade de bridges nativas.
   */
  public async generateDataUrl(payload: string, options?: QrGenerationOptions): Promise<string> {
    if (!payload) throw new Error("Payload vazio para geração de QR Code.");
    return QRCode.toDataURL(payload, {
      width: options?.width || 280,
      margin: options?.margin || 2,
      color: {
        dark: options?.color?.dark || "#000000",
        light: options?.color?.light || "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
  }

  /**
   * CENÁRIO 2: MOTORISTA — Leitura de QR Code via Câmera
   * Avalia a câmera no WebView vs Plugin Nativo do Tauri
   */
  public async scanFromCamera(options?: {
    cameraFacing?: "environment" | "user";
    timeoutMs?: number;
  }): Promise<QrScanResult> {
    // 1. Caso esteja no Tauri Android, tenta utilizar o plugin nativo de barcode scanner
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const nativeScan = await invoke<{ text: string; format: string }>("scan_qr_code", {
          camera: options?.cameraFacing || "environment",
        });

        return {
          text: nativeScan.text,
          format: nativeScan.format,
          source: "tauri-native-scanner",
        };
      } catch (err: any) {
        console.warn("[QrBridge] Plugin nativo de câmera indisponível no Tauri, tentando fallback WebView:", err);
      }
    }

    // 2. Fallback Web Camera (html5-qrcode / getUserMedia)
    // No Android WebView, requer que o WebChromeClient autorize a permissão onPermissionRequest
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        // Verifica permissão da câmera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: options?.cameraFacing || "environment" },
        });

        // Libera a câmera de teste
        stream.getTracks().forEach((track) => track.stop());

        return {
          text: "PENDING_SCANNER_ELEMENT",
          source: "webview-html5-camera",
        };
      } catch (err: any) {
        if (err.name === "NotAllowedError") {
          throw new Error("Permissão de câmera negada no dispositivo Android ou no WebView.");
        }
        throw new Error(`Erro ao acessar câmera no WebView: ${err.message || err}`);
      }
    }

    throw new Error("Nenhum mecanismo de câmera disponível neste ambiente.");
  }
}

export const qrBridge = new QrBridge();
