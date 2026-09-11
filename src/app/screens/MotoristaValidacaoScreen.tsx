import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, BtnGhost, BackHeader, Fonts, StatusBadge } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { passengerApi, driverApi, ValidatedTicketResult, TripPassenger } from "../../services/api";
import { nfcService } from "../../services/nfc";
import { QRCodeCameraScanner } from "../components/QRCodeCameraScanner";
import { playValidationSuccessSound, triggerSuccessHaptic } from "../../services/sound";
import { DEMO_MODE } from "../../services/demoMode";
import { getStoredUserId } from "../../services/session";

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
  const [pendingPassengers, setPendingPassengers] = useState<TripPassenger[]>([]);
  const [resetting, setResetting] = useState(false);

  const nfcSupport = nfcService.checkSupport();

  const loadTripData = useCallback(async () => {
    const id = getStoredUserId();
    if (id) {
      setDriverId(id);
      try {
        const { trips } = await driverApi.getTrips(id);
        if (Array.isArray(trips) && trips.length > 0) {
          const res = await driverApi.getTripPassengers(trips[0].tripId);
          setPendingPassengers(res.passengers || []);
        }
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    loadTripData();
    return () => nfcService.stopScan();
  }, [loadTripData]);

  // Executa validação real contra o backend Node/Express e banco Oracle
  const handleValidateCredential = useCallback(async (credentialRef: string) => {
    setPhase("validating");
    setErrorMessage("");

    try {
      const response = await passengerApi.validateCredential(credentialRef, driverId || undefined);
      setValidatedData(response.data);
      setPhase("success");
      playValidationSuccessSound();
      triggerSuccessHaptic();
      triggerFeedback("success", "Passagem aprovada com sucesso.");
      loadTripData();
    } catch (err: any) {
      if (
        DEMO_MODE &&
        (credentialRef.includes("DEMO") ||
          credentialRef === "INTEGRA-QR-TICKET-DEMO" ||
          (err as any)?.isOffline)
      ) {
        setValidatedData({
          validated: true,
          ticketId: "DEMO-TCK-8812",
          passengerName: "Guilherme Santos",
          seat: 18,
          departure: "São Paulo (Tietê)",
          arrival: "Rio de Janeiro (Novo Rio)",
          used: 1,
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
  }, [driverId, triggerFeedback, loadTripData]);

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

  const handleResetDemoTickets = async () => {
    try {
      setResetting(true);
      await passengerApi.resetDemoTickets();
      setPhase("idle");
      setMode("select");
      setErrorMessage("");
      await loadTripData();
      triggerFeedback("success", "Todas as passagens foram restauradas para prontas para embarque.");
    } catch (err: any) {
      alert("Erro ao restaurar passagens: " + (err.message || "falha de comunicação"));
    } finally {
      setResetting(false);
    }
  };

  const handleReset = () => {
    nfcService.stopScan();
    setMode("select");
    setPhase("idle");
    setValidatedData(null);
    setErrorMessage("");
    loadTripData();
  };

  const awaitingPassengers = pendingPassengers.filter(p => !p.isBoarded && p.status !== "Embarcado");

  return (
    <Screen bg={DS.surface}>
      <BackHeader title="Validar Passageiro" onBack={() => nav("/motorista/home")} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 20px 30px",
          overflowY: "auto",
        }}
      >
        {/* ── SELEÇÃO DE MÉTODO DE VALIDAÇÃO ── */}
        {phase === "idle" && mode === "select" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: DS.primaryLight,
                  border: `2px solid ${DS.primaryMid}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ fontFamily: Fonts.heading, fontSize: 20, margin: "0 0 4px", color: DS.text1 }}>
                Pronto para Validar
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: DS.text2, lineHeight: 1.4 }}>
                Apresente o QR Code da passagem ou aproxime a credencial NFC para autorizar o embarque.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                  height: 48,
                  borderRadius: 12,
                  border: `1.5px solid ${DS.primaryMid}`,
                  background: DS.primaryLight,
                  color: DS.primary,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                  <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="14" r="2" fill={DS.primary} />
                </svg>
                Validar por NFC (Tag Física)
              </button>
            </div>

            {/* ── PASSAGEIROS AGUARDANDO EMBARQUE (CONTINGÊNCIA RÁPIDA) ── */}
            <div style={{ background: DS.bg, borderRadius: 14, padding: "14px", border: `1px solid ${DS.border}` }}>
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: DS.text3, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Aguardando Embarque ({awaitingPassengers.length})
              </p>

              {awaitingPassengers.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12, color: DS.text3, textAlign: "center" }}>
                  Todos os passageiros desta viagem já embarcaram!
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {awaitingPassengers.map((p) => (
                    <div
                      key={p.ticketId}
                      style={{
                        background: DS.surface,
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: `1px solid ${DS.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.text1 }}>
                          {p.passengerName}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: DS.text2 }}>
                          Poltrona {p.seat} · {p.baggageCount} mala(s)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleValidateCredential(p.utHash || p.ticketId)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: DS.primary,
                          color: "#FFF",
                          border: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Validar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Atalho de Reset para demonstração */}
            <button
              type="button"
              onClick={handleResetDemoTickets}
              disabled={resetting}
              style={{
                background: "none",
                border: "none",
                color: DS.primary,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "underline",
                cursor: resetting ? "not-allowed" : "pointer",
                margin: "0 auto",
              }}
            >
              {resetting ? "Restaurando..." : "↻ Restaurar todas as passagens para teste"}
            </button>
          </div>
        )}

        {/* ── MODO QR CODE: LEITURA PELA CÂMERA ── */}
        {phase === "idle" && mode === "qr" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <QRCodeCameraScanner onScanSuccess={handleValidateCredential} />
            <BtnGhost label="Voltar aos métodos" onClick={handleReset} />
          </div>
        )}

        {/* ── MODO NFC: ESCUTA NDEF ── */}
        {phase === "idle" && mode === "nfc" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: DS.primaryLight,
                border: `3px solid ${DS.primary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                animation: "pulse 1.8s infinite ease-in-out",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke={DS.primary} strokeWidth="2.5" strokeLinecap="round" />
                <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke={DS.primary} strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="14" r="2" fill={DS.primary} />
              </svg>
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: 18, color: DS.text1, textAlign: "center" }}>
              Aproxime o Celular do Passageiro
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: DS.text2, textAlign: "center", lineHeight: 1.4 }}>
              Mantenha o aparelho próximo para capturar a credencial segura via NFC.
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
              Verificando autenticidade do bilhete e registrando embarque no Oracle.
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
            <div
              style={{
                width: 76,
                height: 76,
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
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: Fonts.heading, fontSize: 22, margin: "0 0 4px", color: DS.success, textAlign: "center" }}>
              EMBARQUE AUTORIZADO
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: DS.text2, textAlign: "center" }}>
              Passageiro identificado e registrado com sucesso.
            </p>

            <div
              style={{
                width: "100%",
                background: DS.surface,
                borderRadius: 14,
                padding: "16px",
                border: `1px solid ${DS.border}`,
                boxShadow: DS.shadowSm,
                marginBottom: 20,
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
                <span style={{ fontSize: 16, fontWeight: 800, color: DS.primary }}>{validatedData.seat}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Itinerário:</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: DS.text1 }}>
                  {validatedData.departure} → {validatedData.arrival}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Bagagens:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: validatedData.luggagesCount > 0 ? DS.success : DS.text2 }}>
                  {validatedData.luggagesCount} despachada(s)
                </span>
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary label="Validar Próximo Passageiro" onClick={handleReset} />
              <BtnGhost label="Ver Lista de Passageiros" onClick={() => nav("/motorista/passageiros")} />
            </div>
          </motion.div>
        )}

        {/* ── RESULTADO: ERRO / CONFLITO ── */}
        {phase === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0" }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${DS.error}, #dc2626)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                boxShadow: "0 10px 30px rgba(220,38,38,0.4)",
              }}
            >
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: Fonts.heading, fontSize: 20, margin: "0 0 6px", color: DS.error, textAlign: "center" }}>
              PASSAGEIRO NÃO VALIDADO
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: DS.text2, textAlign: "center", lineHeight: 1.4 }}>
              {errorMessage || "Não foi possível autorizar o embarque."}
            </p>

            {/* Se o erro for de bilhete já utilizado, oferece restauração rápida */}
            {errorMessage.includes("já foi utilizada") && (
              <div
                style={{
                  width: "100%",
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid #F59E0B",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: DS.text1, lineHeight: 1.4 }}>
                  Para realizar novas gravações ou testes, você pode restaurar todas as passagens para não utilizadas.
                </p>
                <button
                  type="button"
                  onClick={handleResetDemoTickets}
                  disabled={resetting}
                  style={{
                    marginTop: 8,
                    height: 38,
                    padding: "0 14px",
                    borderRadius: 8,
                    background: "#F59E0B",
                    color: "#FFF",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: resetting ? "not-allowed" : "pointer",
                  }}
                >
                  {resetting ? "Restaurando..." : "↻ Restaurar Todas as Passagens (Demo/Gravação)"}
                </button>
              </div>
            )}

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
