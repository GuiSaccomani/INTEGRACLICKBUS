import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, BackHeader } from "../components/MobileLayout";

export function BagemValidadaScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const nodes = [
    { label: "Passageiro", value: "Guilherme Santos", icon: "👤" },
    { label: "Viagem",     value: "SP → RJ · 21 AGO · 14:30", icon: "🚌" },
    { label: "Bagagem",    value: "IN-20481 · Bagagem 01", icon: "🧳" },
  ];

  return (
    <Screen bg={DS.surface}>
      <BackHeader title="Conferência de bagagem" onBack={() => nav("/bagagens")} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 24px 0" }}>
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ marginBottom: 24, textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: DS.successLight, borderRadius: 14, padding: "12px 20px",
            border: `1.5px solid ${DS.successMid}`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke={DS.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" stroke={DS.success} strokeWidth="2" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 800, color: DS.success }}>Bagagem identificada</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ margin: "0 0 28px", fontSize: 14, color: DS.text2, textAlign: "center", lineHeight: 1.5 }}
        >
          Correspondência confirmada. Esta bagagem pertence a esta viagem.
        </motion.p>

        {/* Connection animation */}
        <div style={{ width: "100%", marginBottom: 24 }}>
          {nodes.map((node, i) => (
            <motion.div key={node.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.1, duration: 0.35 }}
            >
              {/* Node card */}
              <div style={{
                background: DS.bg, borderRadius: 14,
                padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12,
                border: `1.5px solid ${i === 2 ? DS.successMid : DS.border}`,
                boxShadow: i === 2 ? `0 4px 16px rgba(5,150,105,0.1)` : DS.shadowXs,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: i === 2 ? DS.successLight : DS.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>
                  {node.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: DS.text3, letterSpacing: "0.4px", textTransform: "uppercase" }}>{node.label}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 700, color: DS.text1 }}>{node.value}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke={i === 2 ? DS.success : DS.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Connector line */}
              {i < nodes.length - 1 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 24 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.25 }}
                  style={{
                    width: 2, background: `linear-gradient(to bottom, ${DS.primaryMid}, ${DS.primaryLight})`,
                    margin: "0 auto",
                    borderRadius: 2,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{
            width: "100%",
            background: DS.successLight, borderRadius: 14,
            padding: "14px 16px",
            border: `1px solid ${DS.successMid}`,
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.success }}>
            ✓ Esta bagagem pertence a esta viagem.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: DS.text2 }}>Status: Correspondência confirmada</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ padding: "20px 24px 48px", flexShrink: 0 }}
      >
        <button
          onClick={() => nav("/bagagens")}
          style={{
            width: "100%", height: 58, borderRadius: 17, border: "none",
            background: `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
            color: "#fff", fontSize: 16, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Inter', sans-serif",
            boxShadow: DS.shadowPrimary,
          }}
        >
          Voltar para bagagens
        </button>
      </motion.div>
    </Screen>
  );
}
