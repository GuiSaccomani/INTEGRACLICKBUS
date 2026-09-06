/**
 * Acesso centralizado à sessão do usuário persistida no navegador.
 * Evita repetir a leitura e o parsing de localStorage em cada tela.
 */

import type { UserProfile } from "./api";

const USER_KEY = "integra_user";
const ROLE_KEY = "integra_user_role";

/**
 * Recupera o perfil do usuário autenticado gravado no login.
 * Retorna null se não houver sessão ou se o conteúdo estiver corrompido.
 */
export function getStoredUser(): UserProfile | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.userId !== "string" || !parsed.userId) {
      return null;
    }
    return parsed as UserProfile;
  } catch {
    return null;
  }
}

/**
 * Identificador do usuário autenticado, ou string vazia se não houver sessão.
 */
export function getStoredUserId(): string {
  return getStoredUser()?.userId || "";
}

/**
 * Primeiro nome do usuário, para saudações na interface.
 */
export function getStoredFirstName(): string {
  const name = getStoredUser()?.userName?.trim();
  if (!name) return "";
  return name.split(/\s+/)[0];
}

/**
 * Indica se a sessão atual é de um motorista.
 */
export function isDriverSession(): boolean {
  const user = getStoredUser();
  if (user?.roles?.isDriver) return true;
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(ROLE_KEY) === "driver";
}
