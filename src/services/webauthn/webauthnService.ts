import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from '@simplewebauthn/browser';

import type {
  BiometricSupportStatus,
  BiometricAuthResult,
  BiometricStatusResponse,
} from './webauthnTypes';

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
  return 'https://integraclickbus.onrender.com';
}

const API_BASE_URL = getApiBaseUrl();

class WebAuthnClientService {
  /**
   * 1. Verifica se o navegador e o dispositivo suportam biometria / Passkeys
   */
  async checkSupport(): Promise<BiometricSupportStatus> {
    if (typeof window === 'undefined') return 'unsupported';

    // 1. O navegador suporta a Web Authentication API?
    if (!browserSupportsWebAuthn()) {
      return 'unsupported';
    }

    // 2. O dispositivo possui autenticador de plataforma (Touch ID, Face ID, Windows Hello)?
    try {
      const isPlatformAvailable = await platformAuthenticatorIsAvailable();
      if (isPlatformAvailable) {
        return 'available';
      }
      return 'supported';
    } catch {
      return 'supported';
    }
  }

  /**
   * 2. Registra uma nova credencial biométrica para o usuário autenticado
   * @param userId 
   */
  async registerBiometrics(userId: string): Promise<BiometricAuthResult> {
    const support = await this.checkSupport();
    if (support === 'unsupported') {
      return {
        success: false,
        message: 'Seu navegador ou dispositivo não possui suporte a autenticação biométrica.',
      };
    }

    try {
      // 1. Solicita as opções de registro ao backend
      const optionsRes = await fetch(`${API_BASE_URL}/auth/webauthn/register/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!optionsRes.ok) {
        const errData = await optionsRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Não foi possível iniciar o registro biométrico.');
      }

      const options = await optionsRes.json();

      // 2. Aciona o prompt nativo do sistema operacional (Touch ID, Face ID, Windows Hello)
      let attResp;
      try {
        attResp = await startRegistration(options);
      } catch (clientErr: any) {
        if (clientErr.name === 'NotAllowedError' || clientErr.name === 'AbortError') {
          return {
            success: false,
            cancelled: true,
            message: 'Registro biométrico cancelado.',
          };
        }
        throw clientErr;
      }

      // 3. Envia a credencial assinada para o backend validar e persistir
      const verifyRes = await fetch(`${API_BASE_URL}/auth/webauthn/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, response: attResp }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Falha ao confirmar biometria no servidor.');
      }

      // Salva marca local de biometria ativa para sugerir login biométrico rápido na próxima visita
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('integra_biometrics_configured', 'true');
        if (verifyData.credential && verifyData.credential.credentialId) {
          localStorage.setItem('integra_last_credential_id', verifyData.credential.credentialId);
        }
      }

      return {
        success: true,
        message: 'Biometria registrada com sucesso neste dispositivo!',
      };
    } catch (error: any) {
      console.error('[WebAuthn] Erro no registro:', error);
      return {
        success: false,
        message: error.message || 'Erro inesperado ao registrar biometria.',
      };
    }
  }

  /**
   * 3. Realiza login por biometria / Passkey
   * @param email (opcional para restringir a conta)
   */
  async authenticateWithBiometrics(email?: string): Promise<BiometricAuthResult> {
    const support = await this.checkSupport();
    if (support === 'unsupported') {
      return {
        success: false,
        message: 'Autenticação biométrica não suportada neste dispositivo.',
      };
    }

    try {
      // 1. Solicita as opções de autenticação ao backend
      const optionsRes = await fetch(`${API_BASE_URL}/auth/webauthn/login/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!optionsRes.ok) {
        const errData = await optionsRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Não foi possível iniciar o login biométrico.');
      }

      const { options, challengeKey } = await optionsRes.json();

      // 2. Aciona o prompt nativo do sistema operacional
      let asseResp;
      try {
        asseResp = await startAuthentication(options);
      } catch (clientErr: any) {
        if (clientErr.name === 'NotAllowedError' || clientErr.name === 'AbortError') {
          return {
            success: false,
            cancelled: true,
            message: 'Autenticação biométrica cancelada.',
          };
        }
        throw clientErr;
      }

      // 3. Envia a assertion assinada para o backend validar e criar a sessão
      const verifyRes = await fetch(`${API_BASE_URL}/auth/webauthn/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: asseResp, challengeKey }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Não foi possível confirmar sua biometria.');
      }

      // Salva sessão do usuário validado
      if (typeof localStorage !== 'undefined' && verifyData.user) {
        localStorage.setItem('integra_user', JSON.stringify(verifyData.user));
        localStorage.setItem('integra_user_role', verifyData.user.roles?.isDriver ? 'driver' : 'passenger');
        localStorage.setItem('integra_biometrics_configured', 'true');
      }

      return {
        success: true,
        message: 'Biometria confirmada com sucesso!',
        user: verifyData.user,
      };
    } catch (error: any) {
      console.error('[WebAuthn] Erro no login biométrico:', error);
      return {
        success: false,
        message: error.message || 'Não foi possível autenticar com biometria.',
      };
    }
  }

  /**
   * 4. Consulta status e credenciais registradas do usuário no backend
   * @param userId 
   */
  async getStatus(userId: string): Promise<BiometricStatusResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/webauthn/status/${userId}`);
      if (!res.ok) {
        return { registered: false, credentialsCount: 0, credentials: [] };
      }
      return await res.json();
    } catch {
      // Se offline ou erro de rede, consulta flag local
      const isLocallyConfigured = typeof localStorage !== 'undefined' && localStorage.getItem('integra_biometrics_configured') === 'true';
      return {
        registered: isLocallyConfigured,
        credentialsCount: isLocallyConfigured ? 1 : 0,
        credentials: [],
      };
    }
  }

  /**
   * 5. Remove a credencial biométrica do dispositivo
   * @param credentialId 
   * @param userId 
   */
  async removeCredential(credentialId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/webauthn/credentials/${credentialId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json().catch(() => ({}));
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('integra_biometrics_configured');
        localStorage.removeItem('integra_last_credential_id');
      }

      return {
        success: res.ok,
        message: data.message || 'Credencial biométrica removida com sucesso.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao remover credencial biométrica.',
      };
    }
  }

  /**
   * 6. Verifica se o usuário configurou biometria previamente neste navegador
   */
  hasBiometricsConfiguredLocally(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('integra_biometrics_configured') === 'true';
  }
}

export const webauthnService = new WebAuthnClientService();
