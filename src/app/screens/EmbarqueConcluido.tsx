import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { DS, Screen } from "../components/MobileLayout";

function ConfettiDot({ x, y, color, delay, size }: {
  x: number; y: number; color: string; delay: number; size: number;
}) {
  return (
    <motion.div
      initial={{ y: -20, x: x, opacity: 1, scale: 0 }}
      animate={{ y: y, opacity: [1, 1, 0], scale: [0, 1, 0.8] }}
      transition={{ delay, duration: 1.2, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: 0, left: "50%",
        width: size, height: size,
        borderRadius: Math.random() > 0.5 ? "50%" : 3,
        background: color,
        pointerEvents: "none",
      }}
    />
  );
}

const CONFETTI = [
  { x: -80, y: 120, color: DS.primary, delay: 0.2, size: 8 },
  { x: 60, y: 140, color: DS.secondary, delay: 0.3, size: 6 },
  { x: -40, y: 180, color: DS.success, delay: 0.15, size: 7 },
  { x: 90, y: 100, color: "#FF9F1C", delay: 0.25, size: 5 },
  { x: -100, y: 160, color: DS.secondary, delay: 0.4, size: 9 },
  { x: 110, y: 130, color: DS.primary, delay: 0.1, size: 6 },
  { x: -60, y: 200, color: "#FF9F1C", delay: 0.35, size: 5 },
  { x: 70, y: 180, color: DS.success, delay: 0.2, size: 8 },
  { x: 30, y: 220, color: DS.primary, delay: 0.45, size: 6 },
  { x: -20, y: 240, color: DS.secondary, delay: 0.3, size: 7 },
  { x: -130, y: 90, color: DS.success, delay: 0.28, size: 5 },
  { x: 130, y: 100, color: "#FF9F1C", delay: 0.18, size: 6 },
];

export function EmbarqueConcluido() {
  const nav = useNavigate();

  return (
    <Screen bg="#F7F8FA">
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 24px",
        overflow: "hidden", position: "relative",
      }}>
        {/* Confetti */}
        {CONFETTI.map((c, i) => (
          <ConfettiDot key={i} {...c} />
        ))}

        {/* Top ambient */}
        <div style={{
          position: "absolute", top: -100, left: "50%",
          transform: "translateX(-50%)",
          width: 400, height: 300,
          background: `radial-gradient(circle, rgba(123,44,191,0.06) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Success circle */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.4 + i * 0.3, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut",
              }}
              style={{
                position: "absolute", inset: 0,
                borderRadius: "50%",
                border: `2px solid ${DS.success}`,
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: `linear-gradient(135deg, ${DS.success} 0%, #22a84a 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 16px 48px rgba(45,198,83,0.4), 0 4px 12px rgba(45,198,83,0.2)`,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M4 12.5l5 5 11-11"
                stroke="white" strokeWidth="2.8"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <h1 style={{
            margin: 0, fontSize: 26, fontWeight: 800,
            color: DS.textPrimary, letterSpacing: "-0.6px",
            lineHeight: 1.2,
          }}>
            Embarque realizado<br />com sucesso
          </h1>
          <p style={{
            margin: "12px 0 0", fontSize: 16, fontWeight: 500,
            color: DS.textSecondary, lineHeight: 1.5,
          }}>
            Tenha uma excelente viagem! 🚌
          </p>
        </motion.div>

        {/* Trip summary card */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          style={{
            width: "100%",
            background: DS.surface,
            borderRadius: 20, padding: "18px 20px",
            boxShadow: DS.shadowMd,
            border: `1px solid rgba(0,0,0,0.05)`,
            marginBottom: 28,
          }}
        >
          {/* Route */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, marginBottom: 14,
          }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: DS.textPrimary }}>São Paulo</span>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: DS.primaryFaint, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.primary} strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: DS.textPrimary }}>Belo Horizonte</span>
          </div>

          <div style={{ height: 1, background: DS.border, marginBottom: 14 }} />

          {/* Details grid */}
          <div style={{ display: "flex", gap: 0 }}>
            {[
              { label: "Partida", value: "15:30" },
              { label: "Data", value: "25 Mai" },
              { label: "Poltrona", value: "14A" },
            ].map((item, i) => (
              <div key={item.label} style={{
                flex: 1, textAlign: "center",
                borderRight: i < 2 ? `1px solid ${DS.border}` : "none",
              }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: DS.textTertiary, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {item.label}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 800, color: DS.textPrimary }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: DS.border, margin: "14px 0 14px" }} />

          {/* Status badge */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: DS.success }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: DS.success }}>
              Embarque confirmado · Bagagem registrada
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        style={{ padding: "0 24px 44px", flexShrink: 0 }}
      >
        <button
          onClick={() => nav("/home")}
          style={{
            width: "100%", height: 62,
            borderRadius: 18, border: "none",
            background: `linear-gradient(135deg, ${DS.primary} 0%, ${DS.secondary} 100%)`,
            color: "#fff",
            fontSize: 18, fontWeight: 800, letterSpacing: "-0.2px",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            boxShadow: DS.shadowPrimary,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "transform 0.1s, opacity 0.15s",
          }}
          onPointerDown={e => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.opacity = "0.9"; }}
          onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h18M10 5l-7 7 7 7" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar ao início
        </button>
      </motion.div>
    </Screen>
  );
}
