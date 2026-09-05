import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { DS, BtnPrimary } from "../components/MobileLayout";
import { passengerApi, TicketDetails } from "../../services/api";
import { nfcService } from "../../services/nfc";

export function CredencialNFCScreen() {
  const nav = useNavigate();
  const [ticketData, setTicketData] = useState<TicketDetails | null>(null);
  const nfcSupport = nfcService.checkSupport();

  useEffect(() => {
    async function loadTicket() {
      try {
        const savedUser = localStorage.getItem("integra_user");
        let userId = "";
        if (savedUser) {
          try {
            userId = JSON.parse(savedUser).userId;
          } catch (_) {}
        }

        if (userId) {
          const userTickets = await passengerApi.getUserTickets(userId).catch(() => []);
          if (userTickets.length > 0) {
            setTicketData(userTickets[0]);
          }
        }
      } catch (err: any) {
        console.warn("Aviso ao carregar bilhete:", err.message);
      }
    }
    loadTicket();
  }, []);

  const passengerName = ticketData?.passengerName || "Passageiro";
  const seatNumber = ticketData?.seat ? String(ticketData.seat) : "18";
  const departureCity = ticketData?.departure || "São Paulo";
  const arrivalCity = ticketData?.arrival || "Rio de Janeiro";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(170deg, #0D0118 0%, #1A0533 35%, ${DS.primary} 70%, ${DS.secondary} 100%)`,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "52px 20px 14px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => nav(-1)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "1.5px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
          Credencial Digital
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* Main credential card */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 24px 0", overflowY: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          style={{ width: "100%", maxWidth: 340 }}
        >
          {/* Card */}
          <div
            style={{
              borderRadius: 24,
              overflow: "hidden",
              background: `linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)`,
              border: "1.5px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
              padding: "24px 22px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#FFF" }}>Íntegra</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                ClickBus
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                Passageiro
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: "#FFF" }}>
                {passengerName}
              </p>
            </div>

            {/* Route & time */}
            <div
              style={{
                background: "rgba(0,0,0,0.25)",
                borderRadius: 14,
                padding: "12px 14px",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#FFF" }}>{departureCity}</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>→</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#FFF" }}>{arrivalCity}</span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Poltrona</span>
                  <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 800, color: "#FFF" }}>{seatNumber}</p>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
                <div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Status</span>
                  <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: DS.success }}>Confirmado</p>
                </div>
              </div>
            </div>

            {/* Status do NFC / Web */}
            <div
              style={{
                borderRadius: 12,
                padding: "12px 14px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: nfcSupport.isSupported ? DS.success : "#F59E0B",
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#FFF" }}>
                  {nfcSupport.isSupported ? "Web NFC Ativo" : "NFC Não Disponível no Navegador"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
                No navegador Web, o embarque é validado com segurança por QR Code. A leitura por aproximação nativa será suportada no aplicativo Android.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: "16px 24px 36px", flexShrink: 0 }}>
        <BtnPrimary
          label="Apresentar QR Code para Embarque"
          onClick={() => nav("/qrcode")}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="6" height="6" rx="1" stroke="white" strokeWidth="2" />
              <rect x="14" y="4" width="6" height="6" rx="1" stroke="white" strokeWidth="2" />
              <rect x="4" y="14" width="6" height="6" rx="1" stroke="white" strokeWidth="2" />
              <path d="M14 14h6v6h-6v-6z" fill="white" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
