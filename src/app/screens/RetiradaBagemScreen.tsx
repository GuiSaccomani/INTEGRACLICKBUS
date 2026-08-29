import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, StatusBadge } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

type Phase = "waiting" | "reading" | "success";

export function RetiradaBagemScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();
  const [phase, setPhase] = useState<Phase>("waiting");

  function start() {
    if (phase !== "waiting") return;
    setPhase("reading");
    triggerFeedback("neutral", "Aproxime o celular da tag para remover os dados");
    setTimeout(() => {
      setPhase("success");
      triggerFeedback("success", "Tag limpa com sucesso");
    }, 2400);
  }

  const centerBg =
    phase === "success" ? DS.success :
    phase === "reading" ? DS.primary : DS.primaryLight;

  return (
    <Screen bg={DS.surface}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "52px 20px 14px", flexShrink: 0,
        borderBottom: `1px solid ${DS.border}`, background: DS.surface,
      }}>
        <button
          onClick={() => nav("/bagagem-detalhe")}
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
          Limpar tag
        </span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", gap: 0 }}>
        {/* Animação NFC */}
        <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
          {phase === "reading" && [0, 0.7].map((delay, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1.9, opacity: [0, 0.55, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${DS.primary}`, willChange: "transform, opacity" }}
            />
          ))}
          {phase === "success" && (
            <motion.div
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${DS.success}` }}
            />
          )}

          <motion.div
            animate={{ scale: phase === "reading" ? [1, 1.05, 1] : 1 }}
            transition={{ scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } }}
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: centerBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: phase === "success"
                ? `0 8px 32px rgba(5,150,105,0.4)`
                : phase === "reading" ? `0 8px 32px rgba(123,44,191,0.35)` : DS.shadowSm,
              border: phase === "waiting" ? `2px solid ${DS.primaryMid}` : "none",
              transition: "background 0.45s ease, box-shadow 0.4s, border 0.3s",
              cursor: phase === "waiting" ? "pointer" : "default",
              willChange: "transform",
            }}
            onClick={start}
          >
            <AnimatePresence mode="wait">
              {phase !== "success" && (
                <motion.div key="bag" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.25 }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="7" width="16" height="12" rx="2" stroke={phase === "waiting" ? DS.primary : "white"} strokeWidth="2" />
                    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={phase === "waiting" ? DS.primary : "white"} strokeWidth="2" strokeLinecap="round" />
                    <line x1="4" y1="12" x2="20" y2="12" stroke={phase === "waiting" ? DS.primary : "white"} strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </motion.div>
              )}
              {phase === "success" && (
                <motion.div key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <motion.path d="M5 12l4 4 10-10" stroke="white" strokeWidth="2.8"
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

        {/* Texto */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ textAlign: "center", marginBottom: 32 }}
          >
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: DS.text1, letterSpacing: "-0.4px" }}>
              {phase === "waiting"  ? "Limpar tag" :
               phase === "reading"  ? "Limpando tag..." :
                                      "Tag limpa com sucesso"}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: DS.text2, lineHeight: 1.5 }}>
              {phase === "waiting"  ? "Aproxime o celular da tag para remover os dados." :
               phase === "reading"  ? "Removendo dados da bagagem..." :
                                      "Esta tag está pronta para ser reutilizada."}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Badge de bagagem */}
        <div style={{
          background: DS.surface, borderRadius: 12, padding: "14px 18px",
          border: `1px solid ${DS.border}`, width: "100%",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.primary} strokeWidth="1.5" />
              <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.primary} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1 }}>Bagagem 01</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: DS.text2 }}>IN-20481 · NFC ativo</p>
          </div>
          {phase === "success" && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
              <StatusBadge label="Limpa" kind="success" />
            </motion.div>
          )}
        </div>

        {/* Segurança — autorização de retirada */}
        {phase !== "success" && (
          <div style={{
            width: "100%", background: DS.surface,
            border: `1px solid ${DS.border}`,
            borderRadius: 12, padding: "12px 14px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z" stroke={DS.primary} strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke={DS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: DS.primary }}>Autorização de retirada</p>
            </div>
            {[
              { label: "Passageiro", value: "Guilherme Santos" },
              { label: "Criptografia", value: "AES-256 ativo" },
              { label: "Token NFC", value: "IN20481-A3F9" },
            ].map((row, i, a) => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: i < a.length - 1 ? `1px solid ${DS.primaryMid}` : "none",
              }}>
                <span style={{ fontSize: 11, color: DS.text2 }}>{row.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: DS.text1 }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Botão */}
        {phase === "waiting" && (
          <BtnPrimary
            label="Limpar dados"
            onClick={start}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="14" r="2" fill="white" />
              </svg>
            }
          />
        )}

        {phase === "success" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%" }}>
            <BtnPrimary
              label="Voltar para a home"
              onClick={() => nav("/home")}
            />
          </motion.div>
        )}
      </div>
    </Screen>
  );
}
