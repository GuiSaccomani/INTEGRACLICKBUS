import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, StatusBadge } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

type Phase = "waiting" | "reading" | "processing" | "linking" | "success";

function NFCRing({ delay, scale }: { delay: number; scale: number }) {
  const DS = useDS();
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale, opacity: [0, 0.6, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay, ease: "easeOut" }}
      style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: `2px solid ${DS.primary}`,
      }}
    />
  );
}

export function ValidacaoNFCScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();
  const [phase, setPhase] = useState<Phase>("waiting");

  function start() {
    if (phase !== "waiting") return;
    setPhase("reading");
    setTimeout(() => setPhase("processing"), 2000);
    setTimeout(() => setPhase("linking"), 3400);
    setTimeout(() => {
      setPhase("success");
      triggerFeedback("success", "Embarque confirmado");
    }, 4800);
    setTimeout(() => nav("/validada"), 6200);
  }

  const centerColor =
    phase === "success"  ? DS.success :
    phase === "linking"  ? DS.success :
    phase === "processing" ? "#F59E0B" :
    phase === "reading"  ? DS.primary : DS.primaryLight;

  const centerBorder =
    phase === "waiting" ? `2px solid ${DS.primaryMid}` : "none";

  const statusText =
    phase === "waiting"    ? "Aproxime seu celular do celular do motorista" :
    phase === "reading"    ? "Lendo tag NFC..." :
    phase === "processing" ? "Validando passageiro..." :
    phase === "linking"    ? "Vinculando bagagem..." :
                             "Embarque confirmado!";

  const statusSub =
    phase === "waiting"    ? "Não é necessário abrir o QR Code." :
    phase === "reading"    ? "Mantenha os celulares próximos." :
    phase === "processing" ? "Verificando credencial..." :
    phase === "linking"    ? "Bagagem registrada automaticamente." :
                             "Passagem validada e bagagem registrada.";

  return (
    <Screen bg={DS.surface}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "52px 20px 14px", flexShrink: 0,
        borderBottom: `1px solid ${DS.border}`,
        background: DS.surface,
      }}>
        <button
          onClick={() => nav("/passagem")}
          style={{
            width: 40, height: 40, borderRadius: 12,
            border: `1.5px solid ${DS.borderMd}`, background: DS.surface,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke={DS.text1} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: DS.text1 }}>
          Validação NFC
        </span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", gap: 0 }}>

        {/* Animação central */}
        <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
          {(phase === "reading" || phase === "processing") && (
            <>
              <NFCRing delay={0}   scale={1.9} />
              <NFCRing delay={0.7} scale={1.9} />
            </>
          )}
          {(phase === "linking" || phase === "success") && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${DS.success}` }}
              />
            </>
          )}

          {/* Círculo central — background via CSS transition, scale via Motion */}
          <motion.div
            animate={{ scale: phase === "reading" ? [1, 1.05, 1] : 1 }}
            transition={{ scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } }}
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: centerColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: phase === "success" || phase === "linking"
                ? `0 8px 32px rgba(5,150,105,0.4)`
                : phase === "waiting" ? DS.shadowSm
                : `0 8px 32px rgba(123,44,191,0.35)`,
              border: centerBorder,
              cursor: phase === "waiting" ? "pointer" : "default",
              transition: "background 0.45s ease, box-shadow 0.4s, border 0.3s",
              willChange: "transform",
            }}
            onClick={start}
          >
            <AnimatePresence mode="wait">
              {(phase === "waiting" || phase === "reading") && (
                <motion.div key="nfc" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.25 }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <path d="M4.5 7.5C6.2 5.3 8.95 4 12 4s5.8 1.3 7.5 3.5" stroke={phase === "waiting" ? DS.primary : "white"} strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 10.5C8.2 9.1 9.95 8.2 12 8.2s3.8.9 5 2.3" stroke={phase === "waiting" ? DS.primary : "white"} strokeWidth="2" strokeLinecap="round" />
                    <path d="M9.5 13.5c.7-.8 1.65-1.3 2.5-1.3s1.8.5 2.5 1.3" stroke={phase === "waiting" ? DS.primary : "white"} strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="16.5" r="1.5" fill={phase === "waiting" ? DS.primary : "white"} />
                  </svg>
                </motion.div>
              )}
              {phase === "processing" && (
                <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white" }}
                  />
                </motion.div>
              )}
              {phase === "linking" && (
                <motion.div key="link" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="8" width="14" height="11" rx="2" stroke="white" strokeWidth="2" />
                    <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <line x1="5" y1="13" x2="19" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </motion.div>
              )}
              {phase === "success" && (
                <motion.div key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      d="M5 12l4 4 10-10" stroke="white" strokeWidth="2.8"
                      strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45 }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Texto de status */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ textAlign: "center", marginBottom: 36 }}
          >
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: DS.text1, letterSpacing: "-0.4px" }}>
              {statusText}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: DS.text2, lineHeight: 1.5 }}>
              {statusSub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Card passagem + bagagem (fase linking/success) */}
        <AnimatePresence>
          {(phase === "linking" || phase === "success") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0, alignItems: "center" }}
            >
              {/* Card passagem */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                style={{
                  width: "100%", background: DS.surface,
                  border: `1px solid ${DS.border}`,
                  borderRadius: "12px 12px 0 0", padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke={DS.primary} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="14" r="1.5" fill={DS.primary} />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 12, color: DS.text3, fontWeight: 700 }}>Passagem</p>
                  <p style={{ margin: "1px 0 0", fontSize: 13, fontWeight: 600, color: DS.text1 }}>SP → RJ · 14:30 · Assento 18</p>
                </div>
                <StatusBadge label="Validada" kind="success" />
              </motion.div>

              {/* Conector */}
              <div style={{ width: 2, height: 20, background: DS.border }} />

              {/* Card bagagem */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
                style={{
                  width: "100%", background: DS.surface,
                  border: `1px solid ${DS.border}`,
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px", padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.success} strokeWidth="1.5" />
                    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.success} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 12, color: DS.text3, fontWeight: 700 }}>Bagagem</p>
                  <p style={{ margin: "1px 0 0", fontSize: 13, fontWeight: 600, color: DS.text1 }}>Bagagem 01 · IN-20481 · NFC ativo</p>
                </div>
                <StatusBadge label="Automático" kind="success" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão inicial */}
        {phase === "waiting" && (
          <motion.div style={{ width: "100%" }}>
            <BtnPrimary
              label="Simular leitura NFC"
              onClick={start}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="12" cy="14" r="2" fill="white" />
                </svg>
              }
            />
            <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 12, color: DS.text3 }}>
              Toque no botão para simular a aproximação
            </p>
          </motion.div>
        )}
      </div>
    </Screen>
  );
}
