import test from "node:test";
import assert from "node:assert/strict";

// Implementação pura de teste da Máquina de Estados NFC
class MockNfcStateMachine {
  constructor() {
    this.currentState = "IDLE";
    this.currentMode = null;
    this.message = "NFC em repouso";
    this.errorCode = null;
    this.history = [];
  }

  getSnapshot() {
    return {
      state: this.currentState,
      mode: this.currentMode,
      message: this.message,
      errorCode: this.errorCode,
      canCancel: ["WAITING", "READING", "WRITING", "PROCESSING"].includes(this.currentState),
    };
  }

  transition(state, msg = "") {
    this.currentState = state;
    this.message = msg;
    this.history.push(state);
  }

  startOperation(mode) {
    this.currentMode = mode;
    this.errorCode = null;
    this.transition("CHECKING_SUPPORT", "Verificando hardware...");
  }

  toWaiting(msg = "Aguardando aproximação...") {
    this.transition("WAITING", msg);
  }

  toReading() {
    this.transition("READING", "Lendo tag...");
  }

  toWriting() {
    this.transition("WRITING", "Gravando tag...");
  }

  toProcessing() {
    this.transition("PROCESSING", "Validando com a API...");
  }

  success(data) {
    this.transition("SUCCESS", "Concluído com sucesso");
    this.data = data;
  }

  fail(code, msg) {
    this.errorCode = code;
    this.transition("ERROR", msg);
  }

  cancel() {
    if (this.getSnapshot().canCancel) {
      this.fail("USER_CANCELLED", "Cancelado pelo usuário");
    }
  }
}

test("NFC State Machine - Transições de Leitura de Bagagem", () => {
  const fsm = new MockNfcStateMachine();
  assert.equal(fsm.getSnapshot().state, "IDLE");

  fsm.startOperation("READ_BAGGAGE");
  assert.equal(fsm.getSnapshot().state, "CHECKING_SUPPORT");

  fsm.toWaiting();
  assert.equal(fsm.getSnapshot().state, "WAITING");
  assert.equal(fsm.getSnapshot().canCancel, true);

  fsm.toReading();
  assert.equal(fsm.getSnapshot().state, "READING");

  fsm.toProcessing();
  assert.equal(fsm.getSnapshot().state, "PROCESSING");

  fsm.success({ physicalUid: "04:5A:B2:3C:7F:80:1A", baggageId: "BAG_99120" });
  assert.equal(fsm.getSnapshot().state, "SUCCESS");
  assert.equal(fsm.getSnapshot().canCancel, false);
});

test("NFC State Machine - Cancelamento pelo Usuário", () => {
  const fsm = new MockNfcStateMachine();
  fsm.startOperation("WRITE_BAGGAGE");
  fsm.toWaiting();
  assert.equal(fsm.getSnapshot().canCancel, true);

  fsm.cancel();
  assert.equal(fsm.getSnapshot().state, "ERROR");
  assert.equal(fsm.getSnapshot().errorCode, "USER_CANCELLED");
});

test("NFC Payload e Desacoplamento - UID físico != BAGGAGE_ID lógico", () => {
  const physicalUid = "04:5A:B2:3C:7F:80:1A";
  const baggageId = "E3B0C44298FC1C149AFBF4C8996FB924";

  // O UID físico da tag e o BAGGAGE_ID são conceitos completamente distintos
  assert.notEqual(physicalUid, baggageId);
  assert.match(physicalUid, /^([0-9A-Fa-f]{2}[:-]){6,9}[0-9A-Fa-f]{2}$/);
  assert.equal(baggageId.length, 32);

  // Formato do payload NDEF versionado ÍNTEGRA
  const payload = `integra:bag:v1:${baggageId}`;
  assert.equal(payload.startsWith("integra:bag:v1:"), true);
});
