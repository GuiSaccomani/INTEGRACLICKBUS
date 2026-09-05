import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { DS, T, Screen, ScrollBody } from "../components/MobileLayout";

const HISTORY = [
  { id: 1, from: "São Paulo", to: "Campinas", date: "12 Abr", status: "Concluída" },
  { id: 2, from: "Campinas", to: "Rio de Janeiro", date: "28 Mar", status: "Concluída" },
  { id: 3, from: "Rio de Janeiro", to: "São Paulo", date: "15 Mar", status: "Concluída" },
];

function TripHistoryItem({ from, to, date, status }: {
  from: string; to: string; date: string; status: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "14px 0",
      borderBottom: `1px solid ${DS.border}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: DS.primaryFaint,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginRight: 14,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="8" width="20" height="10" rx="2.5" fill={DS.primary} opacity="0.85" />
          <circle cx="7" cy="20" r="2" fill={DS.primary} />
          <circle cx="17" cy="20" r="2" fill={DS.primary} />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary }}>{from}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.textSecondary} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary }}>{to}</span>
        </div>
        <span style={{ fontSize: 12, color: DS.textSecondary, marginTop: 2, display: "block" }}>{date}</span>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700,
        color: DS.success,
        background: DS.successFaint,
        borderRadius: 100, padding: "3px 9px",
        border: `1px solid ${DS.successMid}`,
      }}>{status}</span>
    </div>
  );
}

export function InicioScreen() {
  const nav = useNavigate();

  return (
    <Screen bg="#F7F8FA">
      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, #1A0533 0%, ${DS.primary} 100%)`,
        padding: "52px 24px 28px",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative orb */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px" }}>
              BOM DIA
            </p>
            <h2 style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>
              Carlos Eduardo
            </h2>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="white" opacity="0.9" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="1.8"
                strokeLinecap="round" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* Next trip label */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 8, padding: "4px 10px",
          marginBottom: 14,
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5EE87A" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Próxima viagem
          </span>
        </div>

        {/* Trip card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,0.18)",
            borderRadius: 20,
            padding: "18px 20px",
          }}
        >
          {/* Route */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>São Paulo</span>
            <div style={{
              flex: 1, height: 1.5,
              background: "rgba(255,255,255,0.3)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 20, height: 20,
                background: "rgba(255,255,255,0.15)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Belo Horizonte</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>15:30</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>25 de Maio, 2025</p>
            </div>
            <div style={{
              background: "rgba(93,232,122,0.15)",
              border: "1.5px solid rgba(93,232,122,0.4)",
              borderRadius: 10,
              padding: "8px 14px",
            }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#5EE87A", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                Pronto para
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 12, fontWeight: 800, color: "#5EE87A" }}>Check-in ✓</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main CTA */}
      <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <button
            onClick={() => nav("/minha-passagem")}
            style={{
              width: "100%", height: 62,
              borderRadius: 18, border: "none",
              background: `linear-gradient(135deg, ${DS.primary} 0%, ${DS.secondary} 100%)`,
              color: "#fff",
              fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              boxShadow: DS.shadowPrimary,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              transition: "transform 0.1s, opacity 0.15s",
            }}
            onPointerDown={e => { e.currentTarget.style.transform = "scale(0.97)"; e.currentTarget.style.opacity = "0.9"; }}
            onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
            Iniciar embarque
          </button>
        </motion.div>
      </div>

      {/* History */}
      <ScrollBody style={{ padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Section header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "24px 0 4px",
          }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: DS.textPrimary, letterSpacing: "-0.2px" }}>
              Histórico de viagens
            </span>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: DS.primary,
              fontFamily: "'Inter', sans-serif", padding: 0,
            }}>
              Ver tudo
            </button>
          </div>

          {HISTORY.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.3 }}
            >
              <TripHistoryItem {...item} />
            </motion.div>
          ))}

          {/* Bottom padding */}
          <div style={{ height: 32 }} />
        </motion.div>
      </ScrollBody>
    </Screen>
  );
}
