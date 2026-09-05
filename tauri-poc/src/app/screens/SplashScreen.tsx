import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { DS } from "../components/MobileLayout";

export function SplashScreen() {
  const nav = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => nav("/login"), 2800);
    return () => clearTimeout(timer);
  }, [nav]);

  return (
    <div style={{
      width: "100%", height: "100%",
      background: `linear-gradient(160deg, #1A0533 0%, ${DS.primary} 45%, ${DS.secondary} 100%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "absolute", top: -140, right: -100,
        width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(157,78,221,0.25) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -120, left: -80,
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(123,44,191,0.2) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "50%",
        width: 600, height: 600, borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Logo mark */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ marginBottom: 28 }}
      >
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}>
          {/* Íntegra logo mark — shield + checkmark concept */}
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <path
              d="M26 6 L42 13 L42 26 C42 35 34.5 43 26 46 C17.5 43 10 35 10 26 L10 13 Z"
              fill="white" opacity="0.15"
              stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"
            />
            <path
              d="M26 10 L39 16 L39 26 C39 33.5 33 40.5 26 43 C19 40.5 13 33.5 13 26 L13 16 Z"
              fill="white" opacity="0.9"
            />
            <path
              d="M19 26 L23.5 30.5 L33 21"
              stroke={DS.primary} strokeWidth="2.8"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
      </motion.div>

      {/* Brand name */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
        style={{ textAlign: "center", marginBottom: 12 }}
      >
        <h1 style={{
          margin: 0,
          fontSize: 40,
          fontWeight: 800,
          color: "#FFFFFF",
          letterSpacing: "-1.2px",
          lineHeight: 1,
        }}>
          Íntegra
        </h1>
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        style={{ textAlign: "center", padding: "0 40px" }}
      >
        <p style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 500,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.5,
          letterSpacing: "0.1px",
        }}>
          Embarque inteligente para<br />viagens rodoviárias
        </p>
      </motion.div>

      {/* ClickBus brand hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        style={{
          position: "absolute", bottom: 52,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "2px", textTransform: "uppercase" }}>
          by ClickBus
        </span>
        {/* Dots loader */}
        <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
