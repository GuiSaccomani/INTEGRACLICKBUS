import { useNavigate } from "react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { DS, Screen, ScrollBody } from "../components/MobileLayout";
import { AddToWalletButton } from "../components/AddToWalletButton";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.8px", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 700, color: "#fff" }}>{value}</p>
    </div>
  );
}

function TicketDetail({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 0",
      borderBottom: `1px solid ${DS.border}`,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: DS.primaryFaint,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 11, color: DS.textSecondary, fontWeight: 500 }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: DS.textPrimary }}>{value}</p>
      </div>
    </div>
  );
}

export function MinhaPassagemScreen() {
  const nav = useNavigate();

  return (
    <Screen bg="#F7F8FA">
      {/* Back header */}
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
          Minha Passagem
        </span>
        <div style={{ width: 40 }} />
      </div>

      <ScrollBody style={{ padding: "20px 20px 0" }}>
        {/* Digital ticket card */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(123,44,191,0.22), 0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* Ticket header — gradient */}
          <div style={{
            background: `linear-gradient(135deg, #1A0533 0%, ${DS.primary} 55%, ${DS.secondary} 100%)`,
            padding: "24px 22px 22px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Orb decoration */}
            <div style={{
              position: "absolute", top: -40, right: -40,
              width: 160, height: 160, borderRadius: "50%",
              background: "rgba(255,255,255,0.06)", pointerEvents: "none",
            }} />

            {/* Airline / Company branding */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.12)",
                borderRadius: 10, padding: "6px 12px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="8" width="20" height="10" rx="2.5" fill="white" opacity="0.9" />
                  <circle cx="7" cy="20" r="2" fill="white" />
                  <circle cx="17" cy="20" r="2" fill="white" />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>ClickBus</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
                Nº 4829-SP
              </span>
            </div>

            {/* Route display */}
            <div style={{
              display: "flex", alignItems: "center",
              gap: 10, marginBottom: 22,
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.5px" }}>ORIGEM</p>
                <p style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1 }}>
                  SP
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>São Paulo</p>
              </div>

              {/* Center arrow */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 36, height: 36,
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.3px" }}>
                  ~6h30
                </span>
              </div>

              <div style={{ flex: 1, textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.5px" }}>DESTINO</p>
                <p style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1 }}>
                  BH
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Belo Horizonte</p>
              </div>
            </div>

            {/* Time / date row */}
            <div style={{ display: "flex", gap: 0 }}>
              {[
                { label: "Partida", value: "15:30" },
                { label: "Data", value: "25 Mai" },
                { label: "Poltrona", value: "14A" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  flex: 1, textAlign: "center",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none",
                }}>
                  <InfoRow label={item.label} value={item.value} />
                </div>
              ))}
            </div>
          </div>

          {/* Perforated divider */}
          <div style={{
            background: DS.surface,
            display: "flex", alignItems: "center",
            padding: "0",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", left: -12, width: 24, height: 24,
              borderRadius: "50%", background: "#F7F8FA",
            }} />
            <div style={{
              flex: 1, height: 1, marginLeft: 16, marginRight: 16,
              backgroundImage: `repeating-linear-gradient(to right, ${DS.border} 0, ${DS.border} 6px, transparent 6px, transparent 12px)`,
            }} />
            <div style={{
              position: "absolute", right: -12, width: 24, height: 24,
              borderRadius: "50%", background: "#F7F8FA",
            }} />
          </div>

          {/* Ticket body */}
          <div style={{ background: DS.surface, padding: "8px 22px 20px" }}>
            {/* Passenger */}
            <TicketDetail
              label="Passageiro"
              value="Carlos Eduardo Lima"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke={DS.primary} strokeWidth="2" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
            <TicketDetail
              label="CPF"
              value="***.456.789-**"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke={DS.primary} strokeWidth="2" />
                  <path d="M7 10h10M7 14h6" stroke={DS.primary} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
            />
            <TicketDetail
              label="Classe"
              value="Executivo Leito"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke={DS.primary} strokeWidth="2" />
                  <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.primary} strokeWidth="2" />
                </svg>
              }
            />
            <TicketDetail
              label="Plataforma"
              value="Terminal Tietê · Plataforma 8"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={DS.primary} strokeWidth="2" />
                  <circle cx="12" cy="9" r="2.5" stroke={DS.primary} strokeWidth="2" />
                </svg>
              }
            />

            {/* NFC chip indicator */}
            <div style={{
              marginTop: 16,
              background: DS.primaryFaint,
              border: `1.5px solid ${DS.primaryMid}`,
              borderRadius: 14, padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${DS.primary}, ${DS.secondary})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: DS.shadowPrimary,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="14" r="1.5" fill="white" />
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.primary }}>Credencial NFC integrada</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: DS.textSecondary }}>Passagem pronta para embarque digital</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ padding: "16px 0 36px", display: "flex", flexDirection: "column", gap: 12 }}
        >
          <AddToWalletButton
            passengerName="Carlos Eduardo Lima"
            departure="São Paulo - Tietê"
            arrival="Belo Horizonte"
            seat="14A"
            ticketCode="ITG-4829-SP"
            qrValue="INTEGRA-PASS-4829-SP"
          />

          <button
            onClick={() => nav("/checkin")}
            style={{
              width: "100%", height: 60,
              borderRadius: 18, border: "none",
              background: `linear-gradient(135deg, ${DS.primary} 0%, ${DS.secondary} 100%)`,
              color: "#fff",
              fontSize: 17, fontWeight: 800, letterSpacing: "-0.2px",
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
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" />
            </svg>
            Realizar check-in
          </button>
        </motion.div>
      </ScrollBody>
    </Screen>
  );
}
