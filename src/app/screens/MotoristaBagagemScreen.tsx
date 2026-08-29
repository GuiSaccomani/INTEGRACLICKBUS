import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, BtnGhost, BackHeader, Fonts } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

type Phase = "waiting" | "reading" | "success" | "error";

export function MotoristaBagagemScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback, textSize } = useA11y();
  const [phase, setPhase] = useState<Phase>("waiting");
  const [bagCount, setBagCount] = useState(0);
  
  const titleSize = textSize === "xl" ? 26 : textSize === "large" ? 22 : 18;
  const descSize = textSize === "xl" ? 18 : textSize === "large" ? 16 : 14;

  function simulate(result: "success" | "error") {
    if (phase !== "waiting") return;
    setPhase("reading");
    
    setTimeout(() => {
      setPhase(result);
      if (result === "success") {
        setBagCount(prev => prev + 1);
        triggerFeedback("success", "Bagagem vinculada com sucesso.");
      } else {
        triggerFeedback("error", "Erro ao ler a tag da bagagem.");
      }
    }, 2000);
  }

  const centerColor =
    phase === "success" ? DS.success :
    phase === "error" ? DS.error :
    phase === "reading" ? DS.primary : DS.primaryLight;

  const centerBorder =
    phase === "waiting" ? `2px solid ${DS.primaryMid}` : "none";

  const statusText =
    phase === "waiting" ? "Identificar bagagem" :
    phase === "reading" ? "Lendo tag NFC..." :
    phase === "success" ? "BAGAGEM VINCULADA" :
    "FALHA NA LEITURA";

  const statusSub =
    phase === "waiting" ? "Aproxime o celular da tag da mala." :
    phase === "reading" ? "Aguarde..." :
    phase === "success" ? "A tag foi vinculada ao passageiro." :
    "Tente aproximar o celular novamente.";

  return (
    <Screen bg={DS.surface}>
      <BackHeader title="Adicionar Bagagem" onBack={() => nav("/motorista/home")} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px" }}>
        
        {/* Animação central */}
        <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
          {phase === "reading" && (
            <>
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1.9, opacity: [0, 0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${DS.primary}` }} />
            </>
          )}

          <motion.div
            animate={{ scale: phase === "reading" ? [1, 1.05, 1] : 1 }}
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
                    <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.primary} strokeWidth="2.5" />
                    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.primary} strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
              )}
              {phase === "reading" && (
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
            style={{ textAlign: "center", marginBottom: 20, width: "100%" }}
          >
            <p style={{ margin: 0, fontSize: titleSize, fontWeight: 800, color: phase === "success" ? DS.success : phase === "error" ? DS.error : DS.text1, letterSpacing: "-0.4px" }}>
              {phase === "success" ? "✓ " : phase === "error" ? "! " : ""}{statusText}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: descSize, color: DS.text2, lineHeight: 1.5 }}>
              {statusSub}
            </p>
          </motion.div>
        </AnimatePresence>

        {phase === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ width: "100%", background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 12, padding: 16, marginBottom: 24, boxShadow: DS.shadowXs }}
          >
            <p style={{ margin: "0 0 8px", fontSize: 13, color: DS.text2, fontWeight: 700, fontFamily: Fonts.body }}>DADOS VINCULADOS</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: DS.text2, fontFamily: Fonts.body }}>Passageiro:</span>
              <span style={{ fontSize: 14, color: DS.text1, fontWeight: 700, fontFamily: Fonts.body }}>Marcos Oliveira</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: DS.text2, fontFamily: Fonts.body }}>Destino:</span>
              <span style={{ fontSize: 14, color: DS.text1, fontWeight: 700, fontFamily: Fonts.body }}>Rio de Janeiro</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: DS.text2, fontFamily: Fonts.body }}>Qtd. Bagagens do Passag.:</span>
              <span style={{ fontSize: 14, color: DS.primary, fontWeight: 700, fontFamily: Fonts.body }}>{bagCount} volume(s)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: DS.text2, fontFamily: Fonts.body }}>ID da Última Bagagem:</span>
              <span style={{ fontSize: 14, color: DS.primary, fontWeight: 700, fontFamily: Fonts.body }}>IN-2048{bagCount}</span>
            </div>
          </motion.div>
        )}

        {phase === "waiting" && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <BtnPrimary label="Simular leitura (Sucesso)" onClick={() => simulate("success")} />
            <BtnPrimary label="Simular Erro" onClick={() => simulate("error")} style={{ background: DS.errorLight, color: DS.error, border: `2px solid ${DS.error}` }} />
          </div>
        )}

        {phase === "error" && (
          <div style={{ width: "100%" }}>
            <BtnPrimary label="Tentar novamente" onClick={() => setPhase("waiting")} />
          </div>
        )}

        {phase === "success" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <BtnPrimary label="Adicionar outra bagagem" onClick={() => setPhase("waiting")} style={{ background: DS.primaryLight, color: DS.primary, border: `2px solid ${DS.primaryMid}` }} />
            <BtnGhost label="Concluir" onClick={() => nav("/motorista/home")} />
          </motion.div>
        )}
      </div>
    </Screen>
  );
}
