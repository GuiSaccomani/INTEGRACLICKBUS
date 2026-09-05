import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import type { ReactNode } from "react";
import { DS, Screen } from "../components/MobileLayout";

function SummaryRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 0",
      borderBottom: `1px solid ${DS.border}`,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: DS.primaryFaint,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 11, color: DS.textSecondary }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: DS.textPrimary }}>{value}</p>
      </div>
    </div>
  );
}

export function CheckinScreen() {
  const nav = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setConfirmed(true);
      setTimeout(() => nav("/credencial-nfc"), 1800);
    }, 1000);
  };

  return (
    <Screen bg="#F7F8FA">
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "52px 20px 14px",
        background: DS.surface,
        borderBottom: `1px solid ${DS.border}`,
        flexShrink: 0,
      }}>
        <button
          onClick={() => nav(-1)}
          style={{
            width: 40, height: 40, borderRadius: 12,
            border: `1.5px solid ${DS.border}`,
            background: DS.surface,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: DS.shadowXs,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke={DS.textPrimary} strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: DS.textPrimary }}>
          Check-in
        </span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {!confirmed ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              {/* Info card */}
              <div style={{
                background: DS.surface,
                borderRadius: 20,
                padding: "20px",
                boxShadow: DS.shadowSm,
                border: `1px solid rgba(0,0,0,0.05)`,
                marginBottom: 20,
              }}>
                {/* Route */}
                <div style={{
                  background: `linear-gradient(135deg, ${DS.primary}, ${DS.secondary})`,
                  borderRadius: 14, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 16,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>São Paulo</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", flex: 1, textAlign: "right" }}>Belo Horizonte</span>
                </div>

                <SummaryRow
                  label="Data e horário"
                  value="25 de Maio · 15:30"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke={DS.primary} strokeWidth="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="15" r="1.5" fill={DS.primary} />
                    </svg>
                  }
                />
                <SummaryRow
                  label="Passageiro"
                  value="Carlos Eduardo Lima"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke={DS.primary} strokeWidth="2" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  }
                />
                <SummaryRow
                  label="Poltrona"
                  value="14A · Executivo Leito"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="9" width="7" height="9" rx="1" stroke={DS.primary} strokeWidth="2" />
                      <rect x="14" y="9" width="7" height="9" rx="1" stroke={DS.primary} strokeWidth="2" />
                      <path d="M3 14h18M10 13v5M14 13v5" stroke={DS.primary} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  }
                />
                <div style={{ borderBottom: "none" }}>
                  <SummaryRow
                    label="Plataforma"
                    value="Terminal Tietê · Plataforma 8"
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                          stroke={DS.primary} strokeWidth="2" />
                        <circle cx="12" cy="9" r="2.5" stroke={DS.primary} strokeWidth="2" />
                      </svg>
                    }
                  />
                </div>
              </div>

              {/* Info message */}
              <div style={{
                background: `linear-gradient(135deg, ${DS.primaryFaint}, rgba(157,78,221,0.05))`,
                border: `1.5px solid ${DS.primaryMid}`,
                borderRadius: 16, padding: "16px 18px",
                display: "flex", gap: 12, alignItems: "flex-start",
                marginBottom: 24,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${DS.primary}, ${DS.secondary})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                    <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: DS.primary, fontWeight: 500 }}>
                  Confirme sua presença para gerar sua{" "}
                  <strong>credencial digital NFC</strong> de embarque.
                </p>
              </div>

              <div style={{ flex: 1 }} />

              {/* CTA */}
              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  width: "100%", height: 62,
                  borderRadius: 18, border: "none",
                  background: loading ? "#C8A8E8" : `linear-gradient(135deg, ${DS.primary} 0%, ${DS.secondary} 100%)`,
                  color: "#fff",
                  fontSize: 18, fontWeight: 800, letterSpacing: "-0.2px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: loading ? "none" : DS.shadowPrimary,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "transform 0.1s, opacity 0.15s",
                }}
                onPointerDown={e => { if (!loading) { e.currentTarget.style.transform = "scale(0.97)"; } }}
                onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 24, height: 24, borderRadius: "50%",
                      border: "3px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                    }}
                  />
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" />
                    </svg>
                    Confirmar check-in
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 16,
              }}
            >
              <div style={{ position: "relative", marginBottom: 8 }}>
                {[1, 2].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.8 + i * 0.4, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
                    style={{
                      position: "absolute", inset: 0,
                      borderRadius: "50%",
                      border: `2px solid ${DS.success}`,
                    }}
                  />
                ))}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{
                    width: 88, height: 88, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${DS.success}, #22a84a)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 8px 32px rgba(45,198,83,0.4)`,
                  }}
                >
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      d="M5 12l4 4 10-10"
                      stroke="white" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                    />
                  </svg>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                style={{ textAlign: "center" }}
              >
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: DS.textPrimary, letterSpacing: "-0.4px" }}>
                  Check-in confirmado!
                </h2>
                <p style={{ margin: "8px 0 0", fontSize: 14, color: DS.textSecondary, lineHeight: 1.5 }}>
                  Gerando sua credencial digital NFC...
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ display: "flex", gap: 5, marginTop: 8 }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                    style={{ width: 8, height: 8, borderRadius: "50%", background: DS.primary }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
