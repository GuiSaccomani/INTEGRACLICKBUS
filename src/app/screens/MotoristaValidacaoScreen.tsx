import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, BtnGhost, BackHeader } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

type Phase = "waiting" | "reading_nfc" | "reading_qr" | "success" | "error";

export function MotoristaValidacaoScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback, textSize } = useA11y();
  const [phase, setPhase] = useState<Phase>("waiting");
  
  const titleSize = textSize === "xl" ? 26 : textSize === "large" ? 22 : 18;
  const descSize = textSize === "xl" ? 18 : textSize === "large" ? 16 : 14;

  function simulate(type: "nfc" | "qr", result: "success" | "error") {
    if (phase !== "waiting") return;
    setPhase(type === "nfc" ? "reading_nfc" : "reading_qr");
    
    setTimeout(() => {
      setPhase(result);
      if (result === "success") {
        triggerFeedback("success", "Passageiro validado com sucesso.");
      } else {
        triggerFeedback("error", "Verifique a passagem e tente novamente.");
      }
    }, 2000);
  }

  const centerColor =
    phase === "success" ? DS.success :
    phase === "error" ? DS.error :
    (phase === "reading_nfc" || phase === "reading_qr") ? DS.primary : DS.primaryLight;

  const centerBorder =
    phase === "waiting" ? `2px solid ${DS.primaryMid}` : "none";

  const statusText =
    phase === "waiting" ? "Pronto para validar" :
    phase === "reading_nfc" ? "Lendo tag NFC..." :
    phase === "reading_qr" ? "Lendo QR Code..." :
    phase === "success" ? "EMBARQUE AUTORIZADO" :
    "NÃO FOI POSSÍVEL VALIDAR";

  const statusSub =
    phase === "waiting" ? "Aproxime o celular do passageiro ou leia o QR Code." :
    (phase === "reading_nfc" || phase === "reading_qr") ? "Aguarde..." :
    phase === "success" ? "Passageiro validado com sucesso." :
    "Verifique a passagem e tente novamente.";

  return (
    <Screen bg={DS.surface}>
      <BackHeader title="Validar Passageiro" onBack={() => nav("/motorista/home")} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px" }}>
        
        {/* Animação central */}
        <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
          {(phase === "reading_nfc" || phase === "reading_qr") && (
            <>
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1.9, opacity: [0, 0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${DS.primary}` }} />
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1.9, opacity: [0, 0.6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.7, ease: "easeOut" }} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${DS.primary}` }} />
            </>
          )}

          <motion.div
            animate={{ scale: (phase === "reading_nfc" || phase === "reading_qr") ? [1, 1.05, 1] : 1 }}
            transition={{ scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } }}
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: centerColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: phase === "success" ? `0 8px 32px rgba(5,150,105,0.4)` : phase === "error" ? `0 8px 32px rgba(220,38,38,0.4)` : phase === "waiting" ? DS.shadowSm : `0 8px 32px rgba(123,44,191,0.35)`,
              border: centerBorder,
              transition: "background 0.45s ease, box-shadow 0.4s",
            }}
          >
            <AnimatePresence mode="wait">
              {phase === "waiting" && (
                <motion.div key="waiting" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.25 }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <path d="M4.5 7.5C6.2 5.3 8.95 4 12 4s5.8 1.3 7.5 3.5" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 10.5C8.2 9.1 9.95 8.2 12 8.2s3.8.9 5 2.3" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                    <path d="M9.5 13.5c.7-.8 1.65-1.3 2.5-1.3s1.8.5 2.5 1.3" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="16.5" r="1.5" fill={DS.primary} />
                  </svg>
                </motion.div>
              )}
              {phase === "reading_qr" && (
                <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="6" height="6" rx="1" stroke="white" strokeWidth="2" />
                    <rect x="14" y="4" width="6" height="6" rx="1" stroke="white" strokeWidth="2" />
                    <rect x="4" y="14" width="6" height="6" rx="1" stroke="white" strokeWidth="2" />
                    <path d="M14 14h6v6h-6v-6z" fill="white" />
                  </svg>
                </motion.div>
              )}
              {phase === "reading_nfc" && (
                <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                </motion.div>
              )}
              {phase === "success" && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <motion.path d="M5 12l4 4 10-10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45 }} />
                  </svg>
                </motion.div>
              )}
              {phase === "error" && (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="white" strokeWidth="2" />
                    <path d="M12 8V13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1" fill="white" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            style={{ textAlign: "center", marginBottom: 36, width: "100%" }}
          >
            <p style={{ margin: 0, fontSize: titleSize, fontWeight: 800, color: phase === "success" ? DS.success : phase === "error" ? DS.error : DS.text1, letterSpacing: "-0.4px" }}>
              {phase === "success" ? "✓ " : phase === "error" ? "! " : ""}{statusText}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: descSize, color: DS.text2, lineHeight: 1.5 }}>
              {statusSub}
            </p>
          </motion.div>
        </AnimatePresence>

        {phase === "waiting" && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <BtnPrimary label="Ler NFC (Sucesso)" onClick={() => simulate("nfc", "success")} />
            <BtnPrimary label="Ler QR Code (Sucesso)" onClick={() => simulate("qr", "success")} style={{ background: DS.surface, color: DS.primary, border: `2px solid ${DS.primaryMid}` }} />
            <BtnPrimary label="Simular Erro" onClick={() => simulate("nfc", "error")} style={{ background: DS.errorLight, color: DS.error, border: `2px solid ${DS.error}` }} />
          </div>
        )}

        {phase === "error" && (
          <div style={{ width: "100%" }}>
            <BtnPrimary label="Tentar novamente" onClick={() => setPhase("waiting")} />
          </div>
        )}

        {phase === "success" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <BtnPrimary
              label="Adicionar bagagem"
              onClick={() => nav("/motorista/bagagem")}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="7" width="16" height="12" rx="2" stroke="white" strokeWidth="2.5" />
                  <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              }
              style={{ height: 60, fontSize: 16 }}
            />
            <BtnGhost label="Voltar ao início" onClick={() => nav("/motorista/home")} />
          </motion.div>
        )}
      </div>
    </Screen>
  );
}
