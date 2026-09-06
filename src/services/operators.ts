/**
 * Configuração White-Label do ÍNTEGRA.
 *
 * A identidade da operadora é resolvida na inicialização do app, sem requisição
 * de rede, seguindo esta ordem de precedência:
 *
 * 1. Variáveis de ambiente (`VITE_OPERATOR_*`) — permitem que cada build/deploy
 *    seja publicado com a marca de uma operadora diferente.
 * 2. `VITE_OPERATOR_ID` correspondendo a uma entrada do registro abaixo.
 * 3. Hostname de acesso (ex: `operadora.integra.app` → id `operadora`).
 * 4. Operadora padrão.
 *
 * Para adicionar uma operadora, basta incluir uma entrada em OPERATORS ou
 * definir as variáveis de ambiente no deploy — nenhuma alteração de código
 * de tela é necessária.
 */

export interface OperatorData {
  id: string;
  name: string;
  primaryColor: string;
  primaryDarkColor: string;
  logoUrl?: string;
}

export const DEFAULT_OPERATOR_ID = "clickbus";

/**
 * Registro de operadoras conhecidas.
 */
export const OPERATORS: Record<string, OperatorData> = {
  clickbus: {
    id: "clickbus",
    name: "ClickBus",
    primaryColor: "#7B2CBF",
    primaryDarkColor: "#5B1A9F",
  },
};

function readEnv(key: string): string {
  const env = (import.meta as any).env;
  const value = env && env[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Extrai o identificador da operadora a partir do subdomínio de acesso.
 * Retorna string vazia para hosts locais ou sem subdomínio próprio.
 */
function operatorIdFromHostname(): string {
  if (typeof window === "undefined") return "";

  const host = window.location.hostname;
  if (!host || host === "localhost" || host === "127.0.0.1") return "";
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return "";

  const parts = host.split(".");
  if (parts.length < 3) return "";

  const subdomain = parts[0].toLowerCase();
  // Subdomínios de infraestrutura não identificam operadora
  if (["www", "app", "web", "api", "staging"].includes(subdomain)) return "";

  return subdomain;
}

/**
 * Resolve a operadora ativa desta instância do aplicativo.
 */
export function resolveOperator(): OperatorData {
  const fallback = OPERATORS[DEFAULT_OPERATOR_ID];

  // 1. Sobrescrita completa por variáveis de ambiente
  const envName = readEnv("VITE_OPERATOR_NAME");
  const envPrimary = readEnv("VITE_OPERATOR_PRIMARY");
  if (envName && envPrimary) {
    return {
      id: readEnv("VITE_OPERATOR_ID") || "custom",
      name: envName,
      primaryColor: envPrimary,
      primaryDarkColor: readEnv("VITE_OPERATOR_PRIMARY_DARK") || envPrimary,
      logoUrl: readEnv("VITE_OPERATOR_LOGO") || undefined,
    };
  }

  // 2. Identificador declarado no ambiente
  const envId = readEnv("VITE_OPERATOR_ID").toLowerCase();
  if (envId && OPERATORS[envId]) {
    return OPERATORS[envId];
  }

  // 3. Identificador derivado do domínio de acesso
  const hostId = operatorIdFromHostname();
  if (hostId && OPERATORS[hostId]) {
    return OPERATORS[hostId];
  }

  // 4. Padrão
  return fallback;
}
