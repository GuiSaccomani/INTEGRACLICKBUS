import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { DS } from "../components/MobileLayout";

function NFCRipple({ delay, size }: { delay: number; size: number }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 0 }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
      style={{
        position: "absolute",
        width: size, height: size,
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.5)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    />
  );
}

export function CredencialNFCScreen() {
  const nav = useNavigate();

  return (
    <div style={{
      width: "100%", height: "100%",
      background: `linear-gradient(170deg, #0D0118 0%, #1A0533 35%, ${DS.primary} 70%, ${DS.secondary} 100%)`,
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background ambient */}
      <div style={{
        position: "absolute", top: -80, right: -80,
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(157,78,221,0.2) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: -60,
        width: 260, height: 260, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(123,44,191,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "52px 20px 14px",
        flexShrink: 0,
      }}>
        <button
          onClick={() => nav(-1)}
          style={{
            width: 40, height: 40, borderRadius: 12,
            border: "1.5px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
          Credencial NFC
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* Main credential card */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 24px 0" }}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: "100%", maxWidth: 340 }}
        >
          {/* Credential card — Apple Wallet style */}
          <div style={{
            borderRadius: 28,
            overflow: "hidden",
            background: `linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)`,
            border: "1.5px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
            padding: "26px 24px 22px",
          }}>
            {/* Card header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="16" height="16" viewBox="0 0 52 52" fill="none">
                    <path d="M26 8 L40 14 L40 26 C40 34 33 41 26 44 C19 41 12 34 12 26 L12 14 Z"
                      fill="white" opacity="0.9" />
                    <path d="M19 26 L23.5 30.5 L33 21"
                      stroke={DS.primary} strokeWidth="3.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>Íntegra</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>
                ClickBus
              </span>
            </div>

            {/* Passenger name */}
            <div style={{ marginBottom: 18 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1px", textTransform: "uppercase" }}>
                Passageiro
              </p>
              <p style={{ margin: "5px 0 0", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                Carlos Eduardo
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
                Lima
              </p>
            </div>

            {/* Route & time */}
            <div style={{
              background: "rgba(0,0,0,0.2)",
              borderRadius: 14, padding: "14px 16px",
              marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>São Paulo</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="rgba(255,255,255,0.6)" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Belo Horizonte</span>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.8px", textTransform: "uppercase" }}>Partida</p>
                  <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>15:30</p>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
                <div>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.8px", textTransform: "uppercase" }}>Poltrona</p>
                  <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>14A</p>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
                <div>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.8px", textTransform: "uppercase" }}>Data</p>
                  <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 800, color: "#fff" }}>25 Mai</p>
                </div>
              </div>
            </div>

            {/* NFC status */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(45,198,83,0.12)",
              border: "1.5px solid rgba(45,198,83,0.35)",
              borderRadius: 12, padding: "10px 14px",
            }}>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: DS.success,
                  boxShadow: `0 0 8px ${DS.success}`,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>
                NFC pronto para validação
              </span>
            </div>
          </div>
        </motion.div>

        {/* NFC animation zone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            marginTop: 36,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}
        >
          {/* Ripple container */}
          <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <NFCRipple delay={0} size={100} />
            <NFCRipple delay={0.55} size={100} />
            <NFCRipple delay={1.1} size={100} />

            {/* Center icon */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M4.5 7.5C6.2 5.3 8.95 4 12 4s5.8 1.3 7.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M7 10.5C8.2 9.1 9.95 8.2 12 8.2s3.8.9 5 2.3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M9.5 13.5c.7-.8 1.65-1.3 2.5-1.3s1.8.5 2.5 1.3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1.5" fill="white" />
              </svg>
            </motion.div>
          </div>

          {/* Instruction */}
          <div style={{ textAlign: "center" }}>
            <p style={{
              margin: 0, fontSize: 15, fontWeight: 700,
              color: "#fff", letterSpacing: "-0.2px",
            }}>
              Aproxime seu celular
            </p>
            <p style={{
              margin: "4px 0 0", fontSize: 13, fontWeight: 400,
              color: "rgba(255,255,255,0.55)", lineHeight: 1.4,
            }}>
              do dispositivo de leitura na plataforma
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{ padding: "16px 24px 44px", flexShrink: 0 }}
      >
        <button
          onClick={() => nav("/bagagem")}
          style={{
            width: "100%", height: 60,
            borderRadius: 18, border: "1.5px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            fontSize: 16, fontWeight: 700, letterSpacing: "-0.1px",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "transform 0.1s, opacity 0.15s",
          }}
          onPointerDown={e => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.opacity = "0.8"; }}
          onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="8" width="14" height="11" rx="2" stroke="white" strokeWidth="2" />
            <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 12v4M10 14h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Validar bagagem
        </button>
      </motion.div>
    </div>
  );
}
