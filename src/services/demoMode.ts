/**
 * Modo de demonstração.
 *
 * Habilita atalhos destinados a apresentações e gravação de vídeo — como
 * simular a leitura de um QR Code e aprovar credenciais de exemplo — que não
 * devem existir em uma build publicada, porque exibem aprovação de embarque
 * sem consulta real ao sistema.
 *
 * O controle é por opt-in explícito (`VITE_DEMO_MODE=true`), e não por
 * `import.meta.env.DEV`: como o `.env` da raiz é compartilhado com a API e
 * define `NODE_ENV`, o valor de `DEV` não é confiável neste projeto — um
 * `NODE_ENV=development` no arquivo torna `DEV` verdadeiro até em build de
 * produção.
 *
 * Declarado como constante de módulo com referência estática a
 * `import.meta.env` para que o Vite substitua o valor em tempo de build e o
 * minificador elimine os blocos de demonstração do bundle publicado.
 */
export const DEMO_MODE: boolean = import.meta.env.VITE_DEMO_MODE === "true";
