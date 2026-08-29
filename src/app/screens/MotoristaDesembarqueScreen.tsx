import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, BtnGhost, BackHeader, Fonts } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

type Phase = "waiting" | "reading" | "success" | "error";

export function MotoristaDesembarqueScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback, textSize } = useA11y();
  const [phase, setPhase] = useState<Phase>("waiting");
  const [showConfirm, setShowConfirm] = useState(false);
  
  const titleSize = textSize === "xl" ? 26 : textSize === "large" ? 22 : 18;
  const descSize = textSize === "xl" ? 18 : textSize === "large" ? 16 : 14;

  function simulate(result: "success" | "error") {
    if (phase !== "waiting") return;
    setPhase("reading");
    
    setTimeout(() => {
      setPhase(result);
      if (result === "success") {
        triggerFeedback("success", "Tag limpa com sucesso. Pronta para reutilização.");
      } else {
        triggerFeedback("error", "Erro ao limpar a tag.");
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
    phase === "waiting" ? "Limpar tag NFC" :
    phase === "reading" ? "Acessando tag..." :
    phase === "success" ? "DADOS REMOVIDOS" :
    "FALHA NA LEITURA";

  const statusSub =
    phase === "waiting" ? "Aproxime o celular da tag da bagagem retirada." :
    phase === "reading" ? "Limpando informações..." :
    phase === "success" ? "Esta tag está pronta para ser reutilizada." :
    "Tente aproximar o celular novamente.";

  return (
    <Screen bg={DS.surface}>
      <BackHeader title="Desembarque" onBack={() => nav("/motorista/home")} />

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
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke={DS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <BtnPrimary label="Limpar Tag" onClick={() => setShowConfirm(true)} />
          </div>
        )}

        {/* Modal de confirmação */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
              onClick={() => setShowConfirm(false)}
            >
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                style={{ width: "100%", background: DS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: "30px 20px 40px", boxShadow: DS.shadowMd }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, marginBottom: 20, margin: "0 auto" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke={DS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700, color: DS.text1, textAlign: "center", fontFamily: Fonts.heading }}>
                  Limpar esta Tag?
                </p>
                <p style={{ margin: "0 0 32px", fontSize: 15, color: DS.text2, textAlign: "center", lineHeight: 1.5 }}>
                  Todos os dados vinculados a esta bagagem serão permanentemente removidos. Deseja continuar?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <BtnPrimary label="Sim, limpar tag" onClick={() => { setShowConfirm(false); simulate("success"); }} />
                  <BtnGhost label="Cancelar" onClick={() => setShowConfirm(false)} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "error" && (
          <div style={{ width: "100%" }}>
            <BtnPrimary label="Tentar novamente" onClick={() => setPhase("waiting")} />
          </div>
        )}

        {phase === "success" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <BtnPrimary label="Limpar outra tag" onClick={() => setPhase("waiting")} style={{ background: DS.primaryLight, color: DS.primary, border: `2px solid ${DS.primaryMid}` }} />
            <BtnGhost label="Voltar ao início" onClick={() => nav("/motorista/home")} />
          </motion.div>
        )}
      </div>
    </Screen>
  );
}
