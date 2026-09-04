# ÍNTEGRA — Plataforma de Embarque Digital & Rastreabilidade Multimodal

O **ÍNTEGRA** é uma solução completa de bilhetagem digital rodoviária e controle de bagagens por credenciais eletrônicas seguras, operando sob modelo White-Label.

O repositório é composto por três módulos integrados:
1. **`android/`**: Aplicativo móvel nativo em **Kotlin** com **Jetpack Compose**, **NFC HCE**, **NFC Reader Mode IsoDep**, **CameraX + ML Kit** e **Android Credential Manager**.
2. **`api/`**: Backend oficial em **Node.js / Express**, responsável pelas regras de negócio, FIDO2/WebAuthn e persistência no **Banco de Dados Oracle**.
3. **`src/`**: Aplicação Web / PWA instalável em **React (Vite + TypeScript)** com design dark mode, WebAuthn e Web NFC.

---

## 1. Arquitetura da Solução

```
                    ┌─────────────────────────┐
                    │     React Web / PWA     │
                    │   (Vite + TypeScript)   │
                    └────────────┬────────────┘
                                 │
                                 │ (HTTP / JSON)
                                 ▼
┌──────────────────┐      ┌──────────────┐      ┌─────────────────────────┐
│  Android Nativo  │─────►│ API Node.js  │─────►│      Banco Oracle       │
│ (Kotlin+Compose) │ HTTP │  (Porta 3333)│ SQL  │ (RAW 16 / RAW 32 / CLOB)│
└──────────────────┘      └──────────────┘      └─────────────────────────┘
```

> **Regra Arquitetural:** O Android e o React Web consomem **exclusivamente a API TypeScript**. Nem o Android nem o Web acessam o Oracle diretamente. A API centraliza a validação atômica, anti-replay e controle de ocupação.

---

## 2. Como Rodar a API Backend (`api/`)

### Pré-requisitos
- Node.js 18+ (recomendado Node.js 20 LTS)
- npm

### Passo a Passo
```bash
# 1. Entre no diretório da API
cd api

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente (se necessário)
cp .env.example .env

# 4. Inicie o servidor
npm start
# Ou em modo de desenvolvimento com hot-reload:
npm run dev
```

A API iniciará na porta **`3333`** (`http://localhost:3333` ou IP da rede local para emuladores/dispositivos Android).

### Executar a Suíte de Testes da API
```bash
npm test
```
*Suíte com 60 testes automatizados cobrindo autenticação, papéis de usuário, anti-replay, geração e consumo de desafios WebAuthn e transações operacionais.*

### Status do Banco de Dados Oracle
> **`ORACLE — PENDENTE DE CREDENCIAIS`**  
> Em ambiente local sem credenciais configuradas no `.env`, a API inicializa em modo seguro com fallbacks controlados, permitindo desenvolvimento, homologação e testes de interface sem interrupções.  
> Para conectar a uma instância Oracle real, preencha no `.env`:
> ```env
> ORACLE_USER=seu_usuario
> ORACLE_PASSWORD=sua_senha
> ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
> ```

---

## 3. Como Rodar o React Web / PWA (`src/`)

### Passo a Passo
```bash
# 1. Na raiz do projeto, instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento Vite
npm run dev
```
Acesse `http://localhost:5173` no navegador.

### Gerar Bundle de Produção (PWA)
```bash
npm run build
```

### 📌 Ponto de Integração: Módulo de Leitura QR Code (Web)
> **Aviso para a Equipe de Frontend:**  
> A tela de validação do motorista no Web ([`src/app/screens/MotoristaValidacaoScreen.tsx`](src/app/screens/MotoristaValidacaoScreen.tsx)) já possui o espaço reservado e preparado para receber o componente de câmera dedicado da equipe.  
> - **Onde plugar:** Dentro do bloco `phase === "idle" && mode === "qr"`.  
> - **Callback pronto:** Basta disparar a função `handleValidateCredential(hashLido)` quando seu componente decodificar o QR code.  
> - **Teste manual:** Há um campo de digitação de contingência já acoplado para validação manual de credenciais durante os testes.

---

## 4. Aplicativo Android Nativo (`android/`)

### Stack de Tecnologias Auditadas e Estáveis
- **Linguagem**: Kotlin `1.9.22`
- **Build System**: Android Gradle Plugin `8.2.1` / Gradle `8.2`
- **SDK**: Compile `34` (Android 14) / Min SDK `26` (Android 8.0)
- **UI Toolkit**: Jetpack Compose BOM `2024.04.01` + Material 3
- **Navegação**: Navigation Compose `2.7.6`
- **Rede**: Retrofit `2.9.0` + OkHttp `4.12.0` (TLS 1.3)
- **Persistência**: Jetpack DataStore Preferences `1.0.0`
- **Biometria**: Android Credential Manager `1.3.0` (Passkeys / FIDO2)
- **Câmera & Scanner**: CameraX `1.3.4` + Google ML Kit Barcode Scanning `17.3.0`

### Como Executar os Testes Unitários do Android
```bash
cd android
./gradlew testDebugUnitTest
```
*Executa 5 testes unitários validando condições de passagens, papéis de usuário, APDU SELECT, AID `F0494E5445475241` e desacoplamento de UID de bagagem.*

### Como Gerar o APK de Debug
```bash
cd android
./gradlew assembleDebug
```
O APK será gerado em:  
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 5. Especificações do Protocolo NFC

### 5.1. Validação Passageiro ↔ Motorista (Telefone a Telefone)
- **Estratégia**:
  - **Passageiro**: Host Card Emulation (**HCE** via `HostApduService`).
  - **Motorista**: Reader Mode (**IsoDep** via `enableReaderMode`).
  - *Android Beam descontinuado não é utilizado.*
- **AID Registrado**: `F0494E5445475241` (`F0` + ASCII "INTEGRA").
- **Comando APDU SELECT**: `00 A4 04 00 08 F0 49 4E 54 45 47 52 41 00`.
- **Payload Transmitido**: `INTEGRA:V1:<CREDENTIAL_REF>` seguido da Status Word `90 00`.

### 5.2. Rastreabilidade de Bagagens (Tag Física NDEF)
- **Desacoplamento Rigoroso**:
  $$\text{Physical Tag UID (Hardware)} \neq \text{Business BAGGAGE\_ID (Oracle RAW 32)}$$
  O UID de 7 ou 4 bytes do chip NFC (ex: NTAG213) é puramente hardware. O identificador lógico é um hash de 64 caracteres hexadecimais gravado em registro NDEF MIME `application/vnd.integra.baggage`.
- **Fluxo de Desembarque**:
  Ao aproximar a mala na entrega, o app confere a mala na API (`GET /api/luggages/nfc/:baggageId`) e executa a **limpeza física** dos dados da tag. Se a limpeza física falhar, a operação é bloqueada para evitar tags reutilizadas com dados residuais.

---

## 6. Acessibilidade e Temas (Design System ÍNTEGRA)

- **Suporte a Temas**:
  - `Claro (Light)`: Fundos suaves (`#F9FAFB`) e superfícies brancas.
  - `Escuro (Dark)`: Identidade visual nativa roxa e escura (`#0F172A` / `#1E293B`).
  - `Sistema (Auto)`: Segue as configurações do dispositivo.
- **Tamanho de Texto**: Normal, Grande e Extra Grande.
- **Feedbacks Acessíveis**: Feedback háptico tátil, feedback sonoro e leitor de tela (TalkBack / VoiceOver).

---

## 7. Arquivos Ignorados no Controle de Versão

O repositório está configurado no `.gitignore` para **não versionar**:
- Arquivos binários executáveis (`*.apk`, `*.aab`, `*.jar`).
- Diretórios de compilação (`build/`, `android/app/build/`, `.gradle/`).
- Configurações locais de máquina (`local.properties`).
- Dependências e builds temporários (`node_modules/`, `dist/`, `dev-dist/`).