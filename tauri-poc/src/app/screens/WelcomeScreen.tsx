import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS } from "../components/MobileLayout";

export function WelcomeScreen() {
  const DS = useDS();
  const nav = useNavigate();
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: DS.surface,
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden",
    }}>
      {/* Soft top gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "55%",
        background: `linear-gradient(180deg, ${DS.primaryLight} 0%, rgba(245,240,255,0) 100%)`,
        pointerEvents: "none",
      }} />

      {/* Logo animation area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>

        {/* Animated logo mark oficial ÍNTEGRA */}
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginBottom: 28, position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {/* Ambient glow da marca */}
          <div style={{
            position: "absolute",
            width: 170,
            height: 110,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(157,78,221,0.38) 0%, rgba(123,44,191,0.12) 50%, transparent 75%)",
            filter: "blur(20px)",
            pointerEvents: "none",
          }} />

          <img
            src="/logo-in.png"
            alt="Logotipo Oficial ÍNTEGRA"
            style={{
              width: 140,
              height: 87,
              objectFit: "contain",
              filter: "drop-shadow(0 8px 26px rgba(123, 44, 191, 0.55))",
              position: "relative",
            }}
          />
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45, ease: "easeOut" }}
          style={{ textAlign: "center", marginBottom: 12 }}
        >
          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 900, color: DS.text1, letterSpacing: "-1.5px", lineHeight: 1 }}>
            ÍNTEGRA
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: DS.primary, letterSpacing: "3px", textTransform: "uppercase" }}>
            by ClickBus
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          style={{ textAlign: "center", marginBottom: 0 }}
        >
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: DS.text1, letterSpacing: "-0.5px", lineHeight: 1.3 }}>
            Sua viagem começa aqui.
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 15, fontWeight: 400, color: DS.text2, lineHeight: 1.6, maxWidth: 280 }}>
            Tenha sua passagem, embarque e bagagem sempre com você.
          </p>
        </motion.div>
      </div>

      {/* Bottom CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.45 }}
        style={{ padding: "0 24px 52px", display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}
      >
        <button
          onClick={() => nav("/login")}
          style={{
            width: "100%", height: 60, borderRadius: 18, border: "none",
            background: `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
            color: "#fff", fontSize: 17, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Inter', sans-serif",
            boxShadow: DS.shadowPrimary,
            transition: "transform 0.1s, opacity 0.12s",
          }}
          onPointerDown={e => { e.currentTarget.style.transform = "scale(0.975)"; e.currentTarget.style.opacity = "0.88"; }}
          onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
        >
          Entrar
        </button>
        <button
          onClick={() => nav("/criar-conta")}
          style={{
            width: "100%", height: 56, borderRadius: 16, border: `1.5px solid ${DS.borderMd}`,
            background: DS.surface, color: DS.text1, fontSize: 16, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Inter', sans-serif",
            transition: "transform 0.1s",
          }}
          onPointerDown={e => { e.currentTarget.style.transform = "scale(0.975)"; }}
          onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          Criar conta
        </button>

        <p style={{ margin: "4px 0 0", textAlign: "center", fontSize: 12, color: DS.text3 }}>
          Acesso seguro e criptografado
        </p>
      </motion.div>
    </div>
  );
}
