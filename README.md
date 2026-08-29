# ÍNTEGRA - Plataforma de Embarque Digital (White-Label)

O **ÍNTEGRA** é o projeto front-end do aplicativo de validação de passagens e bagagens por NFC e QR Code, voltado para operações rodoviárias (modelo White-label).

## Estrutura do Projeto

Este projeto é focado estritamente no Front-end Mobile SPA (Single Page Application) construído com React + Vite, sem dependências de ferramentas como Figma ou lixos de ambiente.

*   `src/app/` - Contém todo o código da aplicação e rotas.
*   `src/app/screens/` - Telas completas dos fluxos de Motorista e Passageiro.
*   `src/app/components/` - Design System e componentes unificados (`MobileLayout.tsx`).

## Configuração do Ambiente (Back-end)

Para rodar ou buildar este projeto, utilize o ecossistema Node (o uso de `pnpm` não é recomendado para este projeto, utilize `npm` padrão):

1.  Clone este repositório.
2.  Renomeie `.env.example` para `.env` e ajuste as variáveis de ambiente com os endpoints reais da sua API.
3.  Instale as dependências:
    ```bash
    npm install
    ```
4.  Execute em ambiente de desenvolvimento:
    ```bash
    npm run dev
    ```
5.  Construa para produção:
    ```bash
    npm run build
    ```

## Observações

- **Scripts & Imagens:** Prints, scripts de design e arquivos não-técnicos foram removidos do controle de versão para manter o repositório limpo.
- **Ambiente:** Em produção, a plataforma puxa as cores da operadora dinamicamente via API. O arquivo `.env` deve ser gerado pelo CI/CD de acordo com o deployment (ClickBus, Águia Branca, etc).