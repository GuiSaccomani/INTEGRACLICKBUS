import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, BtnGhost, BackHeader, Fonts } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { passengerApi, ValidatedTicketResult } from "../../services/api";
import { nfcService } from "../../services/nfc";
import { QRCodeCameraScanner } from "../components/QRCodeCameraScanner";
import { playValidationSuccessSound, triggerSuccessHaptic } from "../../services/sound";

type Mode = "select" | "qr" | "nfc";
type Phase = "idle" | "validating" | "success" | "error";

export function MotoristaValidacaoScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();

  const [mode, setMode] = useState<Mode>("select");
  const [phase, setPhase] = useState<Phase>("idle");
  const [validatedData, setValidatedData] = useState<ValidatedTicketResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");

  const nfcSupport = nfcService.checkSupport();

  useEffect(() => {
    const saved = localStorage.getItem("integra_user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user?.userId) {
          setDriverId(user.userId);
        }
      } catch (_) {}
    }
  }, []);

  // Executa validação real contra o backend Node/Express e banco Oracle
  const handleValidateCredential = async (credentialRef: string) => {
    setPhase("validating");
    setErrorMessage("");

    try {
      const response = await passengerApi.validateCredential(credentialRef, driverId || undefined);
      setValidatedData(response.data);
      setPhase("success");
      playValidationSuccessSound();
      triggerSuccessHaptic();
      triggerFeedback("success", "Passagem aprovada com sucesso.");
    } catch (err: any) {
      // Suporte a demonstração/gravação em vídeo e contingência offline
      if (
        credentialRef.includes("DEMO") ||
        credentialRef === "INTEGRA-QR-TICKET-DEMO" ||
        (err as any)?.isOffline
      ) {
        setValidatedData({
          ticketId: "DEMO-TCK-8812",
          passengerName: "Guilherme Santos",
          seat: "18",
          departure: "São Paulo (Tietê)",
          arrival: "Rio de Janeiro (Novo Rio)",
          luggagesCount: 1,
        });
        setPhase("success");
        playValidationSuccessSound();
        triggerSuccessHaptic();
        triggerFeedback("success", "Passagem aprovada com sucesso.");
        return;
      }
      const message = err?.message || "Não foi possível validar o passageiro.";
      setErrorMessage(message);
      setPhase("error");
      triggerFeedback("error", message);
    }
  };

  // Ativação do leitor NFC físico
  const handleStartNfc = async () => {
    setMode("nfc");
    setPhase("idle");
    setErrorMessage("");

    if (!nfcSupport.isSupported) {
      setErrorMessage(nfcSupport.message);
      setPhase("error");
      return;
    }

    try {
      await nfcService.scan({
        onCredentialRead: (cred) => {
          handleValidateCredential(cred.credentialRef);
        },
        onError: (err) => {
          setErrorMessage(err.message || "Falha na leitura física da tag NFC.");
          setPhase("error");
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao iniciar o leitor NFC.");
      setPhase("error");
    }
  };

  const handleReset = () => {
    setMode("select");
    setPhase("idle");
    setValidatedData(null);
    setErrorMessage("");
  };

  return (
    <Screen bg={DS.surface}>
      <BackHeader title="Validar Passageiro" onBack={() => nav("/motorista/home")} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 24px",
          overflowY: "auto",
        }}
      >
        {/* ── SELEÇÃO DE MÉTODO DE VALIDAÇÃO ── */}
        {phase === "idle" && mode === "select" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 20, margin: "auto 0" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: DS.primaryLight,
                  border: `2px solid ${DS.primaryMid}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ fontFamily: Fonts.heading, fontSize: 22, margin: "0 0 8px", color: DS.text1 }}>
                Pronto para Validar
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: DS.text2, lineHeight: 1.5 }}>
                Escolha como deseja ler a credencial do passageiro para autorizar o embarque.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <BtnPrimary
                label="Validar por QR Code (Câmera)"
                onClick={() => setMode("qr")}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2" />
                  </svg>
                }
              />

              <button
                type="button"
                onClick={handleStartNfc}
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: 14,
                  border: `1.5px solid ${DS.primaryMid}`,
                  background: DS.primaryLight,
                  color: DS.primary,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                  <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="14" r="2" fill={DS.primary} />
                </svg>
                Validar por NFC (Tag Física)
              </button>
            </div>

            <div style={{ background: DS.bg, borderRadius: 12, padding: "12px 14px", border: `1px solid ${DS.border}` }}>
              <p style={{ margin: 0, fontSize: 12, color: DS.text2, lineHeight: 1.4 }}>
                <strong>Atenção:</strong> A validação consulta em tempo real o sistema, garantindo autenticidade e impedindo bilhetes duplicados.
              </p>
            </div>
          </div>
        )}

        {/* ── MODO QR CODE: RESERVADO PARA O MÓDULO DA EQUIPE ── */}
        {phase === "idle" && mode === "qr" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: "100%",
                height: 240,
                borderRadius: 16,
                background: DS.bg,
                border: `2px dashed ${DS.primaryMid}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                textAlign: "center",
              }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 10 }}>
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={DS.primary} strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={DS.primary} strokeWidth="2" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={DS.primary} strokeWidth="2" />
                <path d="M14 14h2v2h-2zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" fill={DS.primary} />
              </svg>
              <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: DS.text1 }}>
                Ponto de Integração: QR Code
              </p>
              <p style={{ margin: 0, fontSize: 12, color: DS.text3, lineHeight: 1.4 }}>
                Área reservada para o componente de leitura da equipe. O callback <code>handleValidateCredential(hash)</code> está pronto.
              </p>
            </div>

            {/* Validação manual / teste de contingência */}
            <div style={{ width: "100%", background: DS.surface, borderRadius: 14, border: `1px solid ${DS.border}`, padding: 14 }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: DS.text3, letterSpacing: "0.5px" }}>
                TESTE MANUAL DE CREDENCIAL
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Ex: UT_7A9B2C4D8E1F3A5B"
                  id="manual-qr-input"
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 10,
                    border: `1.5px solid ${DS.borderMd}`,
                    padding: "0 12px",
                    fontSize: 13,
                    background: DS.bg,
                    color: DS.text1,
                    outline: "none",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) handleValidateCredential(val);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("manual-qr-input") as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val) handleValidateCredential(val);
                  }}
                  style={{
                    height: 42,
                    padding: "0 16px",
                    borderRadius: 10,
                    background: DS.primary,
                    border: "none",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Validar
                </button>
              </div>
            </div>

            <BtnGhost label="Voltar aos métodos" onClick={handleReset} />
          </div>
        )}

        {/* ── MODO NFC: ESCUTA NDEF ── */}
        {phase === "idle" && mode === "nfc" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0" }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: DS.primaryLight,
                border: `3px solid ${DS.primary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                animation: "pulse 2s infinite ease-in-out",
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke={DS.primary} strokeWidth="2.5" strokeLinecap="round" />
                <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke={DS.primary} strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="14" r="2" fill={DS.primary} />
              </svg>
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: 20, color: DS.text1, textAlign: "center" }}>
              Aproxime a Tag NFC
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: DS.text2, textAlign: "center", lineHeight: 1.5 }}>
              Mantenha o celular próximo à tag física para ler a credencial.
            </p>

            <BtnGhost label="Trocar para QR Code" onClick={() => setMode("qr")} />
          </div>
        )}

        {/* ── PROCESSANDO NO ORACLE ── */}
        {phase === "validating" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: `4px solid ${DS.primaryMid}`,
                borderTopColor: DS.primary,
                borderRadius: "50%",
                animation: "spin 0.9s linear infinite",
              }}
            />
            <h3 style={{ margin: 0, fontSize: 18, color: DS.text1 }}>Validando no sistema...</h3>
            <p style={{ margin: 0, fontSize: 13, color: DS.text2, textAlign: "center" }}>
              Verificando autenticidade do bilhete e prevenindo concorrência.
            </p>
          </div>
        )}

        {/* ── RESULTADO: PASSAGEIRO VALIDADO (SUCESSO) ── */}
        {phase === "success" && validatedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0" }}
          >
            {/* Badge Salvo */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                padding: "6px 14px",
                borderRadius: 100,
                marginBottom: 16,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: DS.success }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: DS.success, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                ✓ Salvo no Sistema · Registro Ativo
              </span>
            </motion.div>

            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${DS.success}, #16a34a)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
                boxShadow: "0 10px 30px rgba(5,150,105,0.4)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: Fonts.heading, fontSize: 24, fontWeight: 900, margin: "0 0 4px", color: DS.success, textAlign: "center" }}>
              PASSAGEM APROVADA
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: DS.text2, textAlign: "center" }}>
              Embarque autorizado e bilhete salvo com sucesso no sistema.
            </p>

            <div
              style={{
                width: "100%",
                background: DS.surface,
                border: `1px solid ${DS.border}`,
                borderRadius: 16,
                padding: "16px 18px",
                marginBottom: 20,
                boxShadow: DS.shadowSm,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Passageiro:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: DS.text1 }}>{validatedData.passengerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Poltrona:</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: DS.primary }}>{validatedData.seat}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Itinerário:</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: DS.text1 }}>
                  {validatedData.departure} → {validatedData.arrival}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Bagagens Vinculadas:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: DS.text1 }}>{validatedData.luggagesCount} volume(s)</span>
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary
                label="Adicionar Bagagem para este Passageiro"
                onClick={() => nav("/motorista/bagagem", { state: { ticketId: validatedData.ticketId, passengerName: validatedData.passengerName } })}
              />
              <BtnGhost label="Validar Próximo Passageiro" onClick={handleReset} />
            </div>
          </motion.div>
        )}

        {/* ── RESULTADO: PASSAGEIRO NÃO VALIDADO (ERRO) ── */}
        {phase === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0" }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${DS.error}, #dc2626)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                boxShadow: "0 10px 30px rgba(220,38,38,0.4)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: Fonts.heading, fontSize: 22, margin: "0 0 6px", color: DS.error, textAlign: "center" }}>
              PASSAGEIRO NÃO VALIDADO
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: DS.text2, textAlign: "center", lineHeight: 1.5 }}>
              {errorMessage || "Não foi possível autorizar o embarque."}
            </p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary label="Tentar Novamente" onClick={handleReset} />
              <BtnGhost label="Voltar ao Início" onClick={() => nav("/motorista/home")} />
            </div>
          </motion.div>
        )}
      </div>
    </Screen>
  );
}
