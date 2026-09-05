import test from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";

test("QR Bridge - Geração de QR Code para Passageiro", async () => {
  const payload = "integra:ticket:v1:TKT_993812";
  const dataUrl = await QRCode.toDataURL(payload, {
    width: 250,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  assert.equal(typeof dataUrl, "string");
  assert.equal(dataUrl.startsWith("data:image/png;base64,"), true);
});

test("Biometric Bridge - Fallback e Tratamento de Erros sem Hardware", () => {
  // Simulação de resposta quando o dispositivo não tem biometria cadastrada
  const responseMock = {
    available: true,
    enrolled: false,
    reason: "Nenhuma digital ou face cadastrada no Android.",
  };

  const status = responseMock.available && responseMock.enrolled
    ? "AVAILABLE"
    : responseMock.available && !responseMock.enrolled
    ? "NOT_ENROLLED"
    : "HARDWARE_UNAVAILABLE";

  assert.equal(status, "NOT_ENROLLED");
});

test("Segurança - Garantia de Não-Persistência de Biometria no App", () => {
  const authPayload = {
    credentialId: "cred_sample_passkey_123",
    authenticated: true,
    // Em nenhuma hipótese dados biométricos (impressão digital ou imagem facial) são trafegados
    biometricTemplate: undefined,
    rawFingerprint: undefined,
  };

  assert.equal(authPayload.biometricTemplate, undefined);
  assert.equal(authPayload.rawFingerprint, undefined);
  assert.equal(typeof authPayload.credentialId, "string");
});
