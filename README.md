# ÍNTEGRA — Plataforma de Embarque Digital & Rastreabilidade de Bagagens

Solução completa de bilhetagem digital rodoviária e controle de bagagens por credenciais eletrônicas seguras, operando sob modelo White-Label para a **ClickBus**.

---

## Credenciais de Acesso (Demo)

| Perfil | E-mail | Senha |
|---|---|---|
| **Passageiro** | `passageiro@integra.com` | `123456` |
| **Motorista** | `motorista@integra.com` | `123456` |

---

## Estrutura do Projeto

| Módulo | Tecnologia | Descrição |
|---|---|---|
| `android/` | Kotlin + Jetpack Compose | App nativo com NFC HCE, Reader Mode, CameraX + ML Kit |
| `api/` | Node.js + Express | Backend com regras de negócio, WebAuthn e Banco Oracle |
| `src/` | React (Vite + TypeScript) | Web App / PWA instalável com dark mode e Web NFC |

```
┌──────────────────┐      ┌──────────────┐      ┌──────────────────┐
│  Android Nativo  │─────►│ API Node.js  │─────►│   Banco Oracle   │
│ (Kotlin+Compose) │ HTTP │  (Porta 3333)│ SQL  │ (RAW 16/32/CLOB) │
└──────────────────┘      └──────────────┘      └──────────────────┘
                                 ▲
                                 │ HTTP
                    ┌────────────┴────────────┐
                    │     React Web / PWA     │
                    └─────────────────────────┘
```

---

## Como Rodar

### 1. API Backend
```bash
cd api
npm install
npm start        # Porta 3333
```

### 2. Web App (React)
```bash
npm install
npm run dev      # http://localhost:5173
```

### 3. Android (APK Debug)
```bash
cd android
.\gradlew assembleDebug
```
APK gerado em: `C:\Users\GUI\.integra-build\app\outputs\apk\debug\app-debug.apk`

### 4. Testes
```bash
# API (60 testes)
cd api && npm test

# Android (5 testes)
cd android && .\gradlew testDebugUnitTest
```

---

## Protocolo NFC

### Validação de Passageiro (Celular ↔ Celular)
- **Passageiro**: HCE (`HostApduService`) emite credencial
- **Motorista**: Reader Mode (`IsoDep` via `enableReaderMode`) lê credencial
- **AID**: `F0494E5445475241`
- **Payload**: `INTEGRA:V1:<CREDENTIAL_REF>` + SW `90 00`

### Rastreamento de Bagagem (Tag Física NDEF)
- Tag UID (hardware) ≠ BAGGAGE_ID (Oracle RAW 32)
- Payload gravado em registro NDEF no formato `integra:baggage:v1:<baggageId>`