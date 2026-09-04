# ÍNTEGRA - API Node.js / Express & Integração Oracle Database

Esta é a API oficial do projeto **ÍNTEGRA**, responsável por autenticação, gestão de viagens, consulta e validação atômica de passagens digitais e gerenciamento de bagagens conectada ao banco de dados relacional **Oracle**.

---

## 1. Arquitetura

A aplicação segue estritamente a separação em camadas:

```
React Web (Frontend)
       ↓ (HTTP REST / JSON)
API Node/Express
  ├─ Routes (Roteamento & Validação de Parâmetros)
  ├─ Middlewares (CORS, ErrorHandler centralizado)
  ├─ Controllers (Manipulação de Requisição / Resposta)
  ├─ Services (Regras de Negócio & Orquestração Transacional)
  ├─ Repositories (Consultas SQL parametrizadas com bind variables)
  └─ Config (Pool de Conexões Oficial oracledb Thin Mode)
       ↓
Oracle Database (Schema Oficial)
```

O frontend React **nunca** acessa o banco Oracle diretamente.

---

## 2. Schema Oficial do Banco Oracle

A API opera estritamente sobre as tabelas e tipos fornecidos:

- **`USERS`**:
  - `USER_ID RAW(16)` (PK)
  - `USER_NAME VARCHAR2(100)`
  - `USER_EMAIL VARCHAR2(100)` (UNIQUE)
  - `USER_PASSWORD RAW(32)`
  - `USER_PASSANGER NUMBER DEFAULT 1`
  - `USER_DRIVER NUMBER DEFAULT 0`
  - `USER_OPERATOR NUMBER DEFAULT 0`
- **`TRIPS`**:
  - `TRIP_ID RAW(16)` (PK)
  - `TRIP_DATE DATE`
  - `TRIP_DEPARTURE VARCHAR2(100)`
  - `TRIP_ARRIVAL VARCHAR2(100)`
  - `TRIP_TICKETS NUMBER`
  - `TRIP_OCUPATION VARCHAR2(100)`
  - `TRIP_DRIVER RAW(16)` (FK `USERS.USER_ID`)
- **`TICKETS`**:
  - `TICKET_ID RAW(16)` (PK)
  - `TICKET_TRIP RAW(16)` (FK `TRIPS.TRIP_ID`)
  - `TICKET_SEAT NUMBER`
  - `TICKET_SOLD NUMBER`
  - `TICKET_USED NUMBER`
  - `TICKET_TRANSIT_CARD RAW(16)` (FK `TRANSIT_CARDS.CARD_ID`)
- **`USERS_TICKETS`**:
  - `UT_ID RAW(16)` (PK)
  - `UT_USER RAW(16)` (FK `USERS.USER_ID`)
  - `UT_TICKET RAW(16)` (FK `TICKETS.TICKET_ID`)
  - `UT_HASH RAW(32)` (UNIQUE)
- **`BAGGAGE`**:
  - `BAGGAGE_ID RAW(32)` (PK)
  - `BAGGAGE_UT_HASH RAW(32)` (FK `USERS_TICKETS.UT_HASH`)
- **`TRANSIT_CARDS`**:
  - `CARD_ID RAW(16)` (PK)
  - `CARD_USER_ID RAW(16)` (FK `USERS.USER_ID`)
  - `CARD_HASH RAW(32)` (UNIQUE)

---

## 3. Conversão de Tipos RAW(16) e RAW(32)

O módulo `src/utils/rawHelper.js` padroniza a conversão bidirecional:
- **`RAW(16)`**: Representado na aplicação como string hexadecimal de 32 caracteres maiúsculos ou formato UUID com hífens (`8-4-4-4-12`). Na base de dados, é convertido via `HEXTORAW(:param)` e lido com `RAWTOHEX(coluna)`.
- **`RAW(32)`**: Representado na aplicação como string hexadecimal de 64 caracteres maiúsculos (digest binário de 32 bytes).

---

## 4. Variáveis de Ambiente e Configuração

Copie o arquivo `.env.example` localizado na **raiz do projeto** para `.env`:

```bash
cp .env.example .env
```

Parâmetros disponíveis:

```env
PORT=3333
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Oracle Database
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1

# Configurações do Pool
ORACLE_POOL_MIN=2
ORACLE_POOL_MAX=10
ORACLE_POOL_INCREMENT=2
ORACLE_POOL_TIMEOUT=60

# Hashing de Senhas (Opcional - Padrão SHA256)
PASSWORD_HASH_ALGORITHM=SHA256
```

> **IMPORTANTE**: Nunca commite o arquivo `.env` nem credenciais reais no controle de versão.

---

## 5. Endpoints Disponíveis

### Health Check
- `GET /health`: Estado geral do processo Node da API.
- `GET /health/db`: Health check ativo do pool Oracle (`SELECT 1 FROM DUAL`).

### Autenticação
- `POST /login` ou `POST /auth/login`:
  - Body: `{ "email": "usuario@exemplo.com", "password": "..." }`
  - Retorna o perfil do usuário e papéis (`isPassenger`, `isDriver`, `isOperator`).
  - A senha nunca é retornada.
- `GET /auth/profile/:userId`: Consulta dados de perfil do usuário.

### Passageiro & Passagens
- `GET /passenger/ticket/:ticketId`: Retorna detalhes completos do bilhete através das relações `USERS` + `USERS_TICKETS` + `TICKETS` + `TRIPS` e bagagens vinculadas.
- `GET /passenger/user/:userId/tickets`: Lista todas as passagens do passageiro autenticado.
- `POST /passenger/ticket/:ticketId/validate`: Validação atômica e segura contra concorrência do bilhete (`UPDATE TICKETS SET TICKET_USED = 1 WHERE TICKET_ID = :id AND TICKET_USED = 0 AND TICKET_SOLD = 1`).
- `POST /passenger/nfc/scan`: Endpoint compatível para leitura e validação.

### Motorista & Viagens
- `GET /driver/:driverId/trips`: Lista as viagens vinculadas ao motorista (`TRIP_DRIVER = :driverId`). Exige `USER_DRIVER = 1`.
- `GET /driver/trip/:tripId/passengers`: Lista passageiros da viagem através de `TRIPS -> TICKETS -> USERS_TICKETS -> USERS`, com status de embarque e contagem de bagagens.
- `GET /driver/trip/:tripId/summary`: Resumo consolidado de ocupação, total de bilhetes, embarcados e bagagens.
- `POST /driver/nfc/start`: Inicia emissão de sinal de viagem.
- `POST /driver/nfc/stop`: Encerra sinal de viagem.

### Bagagens
- `POST /luggages`:
  - Body: `{ "ticketId": "...", "baggageId": "..." }` (o `baggageId` é opcional; se não informado, é gerado um RAW(32) seguro).
  - Valida a existência do ticket e recupera o `USERS_TICKETS.UT_HASH`.
  - Executa inserção em `BAGGAGE` associando a `UT_HASH` dentro de transação atômica.
- `GET /luggages/ticket/:ticketId`: Lista bagagens da passagem.
- `DELETE /luggages/:id`: Remove bagagem garantindo integridade referencial.

---

## 6. Como Iniciar a API

Instalar dependências:
```bash
npm install
```

Executar em modo desenvolvimento:
```bash
npm run dev
```

Executar a suíte de testes automatizados:
```bash
npm test
```

---

## 7. Dependência Conhecida: Algoritmo de Hashing de Senhas

O campo `USERS.USER_PASSWORD` é `RAW(32)` (256 bits).
O schema Oracle fornecido não detalha se as senhas foram geradas com `STANDARD_HASH(pwd, 'SHA256')`, HMAC, ou salt específico.
Essa dependência está **completamente isolada** no módulo `src/utils/passwordVerifier.js`. Para produção, basta confirmar com o time de banco de dados qual função SQL foi utilizada para persistência das senhas e, se necessário, ajustar o driver de digest nesse módulo.
