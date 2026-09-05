import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, BtnGhost, StatusBadge } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { nfcService } from "../../services/nfc";

type Phase = "waiting" | "reading" | "success" | "error";

export function RetiradaBagemScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();

  const [phase, setPhase] = useState<Phase>("waiting");
  const [errorMessage, setErrorMessage] = useState("");
  const nfcSupport = nfcService.checkSupport();

  const handleClearTag = async () => {
    setErrorMessage("");

    if (!nfcSupport.isSupported) {
      // Se não houver suporte Web NFC, conclui o fluxo lógico e avisa
      setPhase("success");
      triggerFeedback("success", "Tag liberada logicamente.");
      return;
    }

    setPhase("reading");
    triggerFeedback("neutral", "Aproxime o celular da tag para limpar");

    try {
      await nfcService.clearTag();
      setPhase("success");
      triggerFeedback("success", "Tag física limpa com sucesso.");
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao limpar fisicamente a tag NFC.");
      setPhase("error");
      triggerFeedback("error", "Falha na limpeza da tag.");
    }
  };

  return (
    <Screen bg={DS.surface}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "52px 20px 14px",
          flexShrink: 0,
          borderBottom: `1px solid ${DS.border}`,
          background: DS.surface,
        }}
      >
        <button
          onClick={() => nav(-1)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: `1.5px solid ${DS.borderMd}`,
            background: DS.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke={DS.text1} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: DS.text1 }}>
          Limpar Tag de Bagagem
        </span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px" }}>
        {/* Animação NFC */}
        <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <motion.div
            animate={{ scale: phase === "reading" ? [1, 1.05, 1] : 1 }}
            transition={{ scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } }}
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: phase === "success" ? DS.success : phase === "error" ? DS.error : DS.primaryLight,
              border: `2px solid ${phase === "success" ? DS.success : phase === "error" ? DS.error : DS.primary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: phase === "success" ? "0 8px 32px rgba(5,150,105,0.4)" : DS.shadowSm,
            }}
          >
            {phase === "success" ? (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : phase === "error" ? (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.primary} strokeWidth="2" />
                <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </motion.div>
        </div>

        {/* Texto */}
        <div style={{ textAlign: "center", marginBottom: 28, width: "100%" }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: DS.text1, letterSpacing: "-0.4px" }}>
            {phase === "waiting"
              ? "Limpar Tag NFC"
              : phase === "reading"
              ? "Aproxime a Tag Física..."
              : phase === "success"
              ? "Tag Pronta para Reuso"
              : "Falha na Limpeza"}
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: DS.text2, lineHeight: 1.5 }}>
            {phase === "waiting"
              ? "Ao desocupar a mala, limpe os dados da tag NFC física para que possa ser utilizada em viagens futuras."
              : phase === "reading"
              ? "Mantenha o celular encostado na tag da mala para sobrescrever o NDEF."
              : phase === "success"
              ? "Os dados foram removidos e a tag está disponível para nova vinculação."
              : errorMessage || "Não foi possível limpar a tag. Tente novamente."}
          </p>
        </div>

        {/* Botão de ação */}
        {phase === "waiting" && (
          <BtnPrimary
            label={nfcSupport.isSupported ? "Limpar Tag NFC Física" : "Confirmar Liberação"}
            onClick={handleClearTag}
          />
        )}

        {phase === "error" && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <BtnPrimary label="Tentar Novamente" onClick={() => setPhase("waiting")} />
            <BtnGhost label="Voltar" onClick={() => nav("/bagagens")} />
          </div>
        )}

        {phase === "success" && (
          <BtnPrimary label="Voltar para Minhas Bagagens" onClick={() => nav("/bagagens")} />
        )}
      </div>
    </Screen>
  );
}
