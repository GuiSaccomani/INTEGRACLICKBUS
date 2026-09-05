import { isTauriEnvironment } from "../nfc/nfcBridge";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

export type BiometricStatus =
  | "AVAILABLE"
  | "NOT_ENROLLED"
  | "HARDWARE_UNAVAILABLE"
  | "UNSUPPORTED";

export interface BiometricAuthResult {
  success: boolean;
  credentialId?: string;
  source: "android-credential-manager" | "webauthn-browser" | "fallback-password";
  error?: string;
  userCancelled?: boolean;
}

/**
 * Ponte de Autenticação Biométrica / Passkeys para a POC Tauri 2 — ÍNTEGRA
 * 
 * ATENÇÃO TÉCNICA:
 * O Android System WebView NÃO expõe navigator.credentials com autenticador
 * de plataforma nativo (FIDO2) para origens locais (tauri://localhost).
 * Portanto, no ambiente Tauri Android, a biometria/passkeys é delegada
 * para o androidx.credentials.CredentialManager nativo do sistema operacional.
 */
class BiometricBridge {
  private async invokeTauri<T>(command: string, args?: Record<string, any>): Promise<T> {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<T>(command, args);
  }

  /**
   * Verifica se o aparelho possui biometria/passkey disponível e configurada
   */
  public async checkAvailability(): Promise<{ status: BiometricStatus; message: string }> {
    if (isTauriEnvironment()) {
      try {
        const res = await this.invokeTauri<{
          available: boolean;
          enrolled: boolean;
          reason?: string;
        }>("check_biometrics_available");

        if (res.available && res.enrolled) {
          return {
            status: "AVAILABLE",
            message: "Android Credential Manager disponível com biometria cadastrada.",
          };
        } else if (res.available && !res.enrolled) {
          return {
            status: "NOT_ENROLLED",
            message: "Dispositivo suporta biometria, mas nenhuma digital/face está cadastrada no sistema.",
          };
        } else {
          return {
            status: "HARDWARE_UNAVAILABLE",
            message: res.reason || "Hardware biométrico indisponível neste aparelho.",
          };
        }
      } catch (err: any) {
        return {
          status: "HARDWARE_UNAVAILABLE",
          message: `Falha ao consultar Credential Manager nativo: ${err.message || err}`,
        };
      }
    }

    // Ambiente Web padrão
    if (typeof window !== "undefined" && window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return {
          status: available ? "AVAILABLE" : "HARDWARE_UNAVAILABLE",
          message: available
            ? "Autenticador de plataforma WebAuthn disponível."
            : "Navegador não possui autenticador biométrico local ativo.",
        };
      } catch {
        return { status: "UNSUPPORTED", message: "Erro ao consultar WebAuthn no navegador." };
      }
    }

    return { status: "UNSUPPORTED", message: "WebAuthn / Credential Manager não suportado neste ambiente." };
  }

  /**
   * Executa a autenticação biométrica do usuário
   * Delegando ao Android Credential Manager no Tauri ou ao WebAuthn no Web
   */
  public async authenticate(options?: {
    challenge?: string;
    rpId?: string;
    requestJson?: any;
  }): Promise<BiometricAuthResult> {
    // 1. Se estiver rodando dentro do Tauri Android
    if (isTauriEnvironment()) {
      try {
        const nativeResult = await this.invokeTauri<{
          authenticated: boolean;
          credentialId?: string;
          cancelled?: boolean;
          error?: string;
        }>("authenticate_credential_manager", {
          challenge: options?.challenge || "integra_auth_challenge",
          rpId: options?.rpId || "com.integra.tauri",
        });

        if (nativeResult.cancelled) {
          return {
            success: false,
            userCancelled: true,
            source: "android-credential-manager",
            error: "Autenticação cancelada pelo usuário.",
          };
        }

        if (nativeResult.authenticated && nativeResult.credentialId) {
          return {
            success: true,
            credentialId: nativeResult.credentialId,
            source: "android-credential-manager",
          };
        }

        return {
          success: false,
          source: "android-credential-manager",
          error: nativeResult.error || "Falha na validação da credencial no Android.",
        };
      } catch (err: any) {
        return {
          success: false,
          source: "android-credential-manager",
          error: err.message || "Erro de comunicação com o Credential Manager Android.",
        };
      }
    }

    // 2. Fallback WebAuthn para Web Browser
    if (options?.requestJson) {
      try {
        const webAuthnRes = await startAuthentication(options.requestJson);
        return {
          success: true,
          credentialId: webAuthnRes.id,
          source: "webauthn-browser",
        };
      } catch (err: any) {
        const isCancelled = err.name === "NotAllowedError" || err.message?.includes("cancelled");
        return {
          success: false,
          userCancelled: isCancelled,
          source: "webauthn-browser",
          error: err.message || "Erro na autenticação WebAuthn.",
        };
      }
    }

    return {
      success: false,
      source: "fallback-password",
      error: "Opções de autenticação WebAuthn não fornecidas.",
    };
  }
}

export const biometricBridge = new BiometricBridge();
