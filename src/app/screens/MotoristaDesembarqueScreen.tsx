import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, BtnGhost, BackHeader, Fonts } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { luggageApi, LuggageDetail } from "../../services/api";
import { nfcService } from "../../services/nfc";

type Phase = "idle" | "reading_nfc" | "confirm" | "releasing" | "success" | "error";

export function MotoristaDesembarqueScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();

  const [phase, setPhase] = useState<Phase>("idle");
  const [baggageDetail, setBaggageDetail] = useState<LuggageDetail | null>(null);
  const [manualBaggageId, setManualBaggageId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [physicalTagCleaned, setPhysicalTagCleaned] = useState(true);

  const nfcSupport = nfcService.checkSupport();

  // Busca dados da bagagem pelo BAGGAGE_ID
  const handleFetchBaggage = async (baggageId: string) => {
    setPhase("releasing");
    setErrorMessage("");

    try {
      const cleanId = baggageId.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
      const res = await luggageApi.getById(cleanId);
      setBaggageDetail(res.luggage);
      setPhase("confirm");
    } catch (err: any) {
      setErrorMessage(err.message || "Bagagem não encontrada no sistema.");
      setPhase("error");
    }
  };

  // Inicia leitura de tag NFC física
  const handleStartScan = async () => {
    setErrorMessage("");

    if (!nfcSupport.isSupported) {
      setErrorMessage(nfcSupport.message);
      setPhase("error");
      return;
    }

    setPhase("reading_nfc");

    try {
      await nfcService.scan({
        onBaggageRead: (bag) => {
          handleFetchBaggage(bag.baggageId);
        },
        onError: (err) => {
          setErrorMessage(err.message || "Falha ao ler a tag NFC da bagagem.");
          setPhase("error");
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao iniciar o leitor de tag.");
      setPhase("error");
    }
  };

  // Confirmação final da entrega e limpeza da tag
  const handleConfirmRelease = async () => {
    if (!baggageDetail?.baggageId) return;

    setPhase("releasing");
    setErrorMessage("");

    try {
      // 1. Encerra associação no Oracle (DELETE seguro em BAGGAGE)
      await luggageApi.removeLuggage(baggageDetail.baggageId);

      // 2. Tenta limpar fisicamente a tag NFC se Web NFC estiver disponível
      let cleaned = true;
      if (nfcSupport.isSupported) {
        try {
          await nfcService.clearTag();
        } catch (cleanErr) {
          console.warn("Aviso: Limpeza física da tag falhou ou tag não aproximada:", cleanErr);
          cleaned = false;
        }
      }

      setPhysicalTagCleaned(cleaned);
      setPhase("success");
      triggerFeedback("success", "Desembarque da bagagem confirmado.");
    } catch (apiErr: any) {
      setErrorMessage(apiErr.message || "Erro ao desvincular bagagem no banco.");
      setPhase("error");
      triggerFeedback("error", "Erro ao confirmar desembarque.");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setBaggageDetail(null);
    setManualBaggageId("");
    setErrorMessage("");
  };

  return (
    <Screen bg={DS.surface}>
      <BackHeader title="Desembarque de Bagagem" onBack={() => nav("/motorista/home")} />

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
        {phase === "idle" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 18, margin: "auto 0" }}>
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
                  margin: "0 auto 12px",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke={DS.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ fontFamily: Fonts.heading, fontSize: 20, margin: "0 0 6px", color: DS.text1 }}>
                Identificar Bagagem para Entrega
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: DS.text2, lineHeight: 1.4 }}>
                Aproxime o celular da tag NFC da mala ou digite o código da etiqueta.
              </p>
            </div>

            <BtnPrimary
              label="Ler Tag NFC da Mala"
              onClick={handleStartScan}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="12" cy="14" r="2" fill="white" />
                </svg>
              }
            />

            {/* Entrada manual de contingência */}
            <div style={{ background: DS.bg, borderRadius: 14, padding: 14, border: `1px solid ${DS.border}` }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: DS.text3, textTransform: "uppercase", marginBottom: 6 }}>
                Buscar por Código Manual
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={manualBaggageId}
                  onChange={(e) => setManualBaggageId(e.target.value)}
                  placeholder="ID da Bagagem (64 hex)"
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${DS.border}`,
                    background: DS.surface,
                    color: DS.text1,
                    fontSize: 13,
                    padding: "0 10px",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleFetchBaggage(manualBaggageId)}
                  style={{
                    height: 44,
                    padding: "0 14px",
                    borderRadius: 10,
                    background: DS.primary,
                    color: "#FFF",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === "reading_nfc" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: DS.primaryLight,
                border: `3px solid ${DS.primary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse 1.5s infinite ease-in-out",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="14" r="2" fill={DS.primary} />
              </svg>
            </div>
            <h3 style={{ margin: 0, fontSize: 18, color: DS.text1 }}>Aproxime da Mala</h3>
            <p style={{ margin: 0, fontSize: 13, color: DS.text2, textAlign: "center" }}>
              Lendo os dados gravados na tag física NDEF...
            </p>
            <BtnGhost label="Cancelar" onClick={handleReset} />
          </div>
        )}

        {/* ── CONFIRMAÇÃO DE DADOS DA BAGAGEM ── */}
        {phase === "confirm" && baggageDetail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 16, margin: "auto 0" }}
          >
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontFamily: Fonts.heading, fontSize: 20, margin: "0 0 6px", color: DS.text1 }}>
                Conferir Bagagem do Passageiro
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: DS.text2 }}>
                Confirme os dados antes de entregar a mala ao passageiro.
              </p>
            </div>

            <div
              style={{
                background: DS.surface,
                borderRadius: 14,
                padding: "16px",
                border: `1px solid ${DS.border}`,
                boxShadow: DS.shadowSm,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Passageiro:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: DS.text1 }}>{baggageDetail.passengerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Poltrona:</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: DS.primary }}>{baggageDetail.seat}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Viagem:</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: DS.text1 }}>
                  {baggageDetail.departure} → {baggageDetail.arrival}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>ID Bagagem:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: DS.text2, fontFamily: "monospace" }}>
                  {baggageDetail.baggageId.slice(0, 16)}...
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary label="Confirmar Entrega e Liberar Tag" onClick={handleConfirmRelease} />
              <BtnGhost label="Cancelar" onClick={handleReset} />
            </div>
          </motion.div>
        )}

        {phase === "releasing" && (
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
            <h3 style={{ margin: 0, fontSize: 18, color: DS.text1 }}>Encerrando Associação no Sistema...</h3>
            <p style={{ margin: 0, fontSize: 13, color: DS.text2, textAlign: "center" }}>
              Removendo registro e procedendo com a limpeza da tag física.
            </p>
          </div>
        )}

        {/* ── RESULTADO DE SUCESSO ── */}
        {phase === "success" && (
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
                background: `linear-gradient(135deg, ${DS.success}, #16a34a)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                boxShadow: "0 10px 30px rgba(5,150,105,0.4)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: Fonts.heading, fontSize: 22, margin: "0 0 6px", color: DS.success, textAlign: "center" }}>
              DESEMBARQUE CONFIRMADO
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: DS.text2, textAlign: "center" }}>
              Associação de bagagem encerrada com sucesso no sistema.
            </p>

            {/* Alerta de limpeza física de tag (conforme especificado no requisito 14) */}
            <div
              style={{
                width: "100%",
                borderRadius: 14,
                padding: "14px",
                marginBottom: 20,
                background: physicalTagCleaned ? "rgba(5,150,105,0.1)" : "rgba(245,158,11,0.12)",
                border: `1px solid ${physicalTagCleaned ? DS.success : "#F59E0B"}`,
              }}
            >
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: physicalTagCleaned ? DS.success : "#D97706" }}>
                {physicalTagCleaned ? "✓ Tag Física Limpa" : "⚠️ Tag Física Não Reinicializada"}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: DS.text1, lineHeight: 1.4 }}>
                {physicalTagCleaned
                  ? "A tag NDEF foi sobrescrita e está pronta para ser reutilizada em outra bagagem."
                  : "A retirada foi realizada no sistema, mas a tag física precisa ser limpa/reprocessada antes de reutilização."}
              </p>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary label="Entregar Outra Bagagem" onClick={handleReset} />
              <BtnGhost label="Voltar ao Início" onClick={() => nav("/motorista/home")} />
            </div>
          </motion.div>
        )}

        {/* ── ERRO ── */}
        {phase === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0" }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: DS.error,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: Fonts.heading, fontSize: 20, margin: "0 0 8px", color: DS.error, textAlign: "center" }}>
              FALHA NO DESEMBARQUE
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: DS.text2, textAlign: "center", lineHeight: 1.5 }}>
              {errorMessage || "Erro ao consultar ou desvincular a bagagem."}
            </p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary label="Tentar Novamente" onClick={handleReset} />
              <BtnGhost label="Voltar" onClick={() => nav("/motorista/home")} />
            </div>
          </motion.div>
        )}
      </div>
    </Screen>
  );
}
