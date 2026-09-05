import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, BtnPrimary, StatusBadge, Fonts } from "../components/MobileLayout";
import { passengerApi, TicketDetails } from "../../services/api";
import { QRCodeRenderer } from "../components/QRCodeRenderer";
import { playValidationSuccessSound, triggerSuccessHaptic } from "../../services/sound";

export function QRCodeScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const [ticketData, setTicketData] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTicket() {
      setLoading(true);
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
            return;
          }
        }
      } catch (err: any) {
        console.warn("Aviso ao carregar bilhete:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, []);

  const passengerName = ticketData?.passengerName || "Passageiro";
  const seatNumber = ticketData?.seat ? String(ticketData.seat) : "18";
  const departureCity = ticketData?.departure || "São Paulo";
  const arrivalCity = ticketData?.arrival || "Rio de Janeiro";
  const isUsed = ticketData?.used === 1;

  // Credencial segura: UT_HASH (64 hex chars) ou Ticket ID (32 hex chars)
  const credentialRef = ticketData?.utHash || ticketData?.ticketId || "INTEGRA-DEMO";

  return (
    <Screen bg={DS.surface}>
      {/* Header */}
      <div
        style={{
          background: DS.surface,
          padding: "54px 24px 20px",
          borderBottom: `1px solid ${DS.border}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => nav(-1)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: `1.5px solid ${DS.borderMd}`,
            background: DS.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke={DS.text1} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: Fonts.heading, margin: "0 0 4px", fontSize: 20, color: DS.text1 }}>
            QR Code de Embarque
          </h1>
          <p style={{ fontFamily: Fonts.body, margin: 0, fontSize: 13, color: DS.text2 }}>
            Apresente este código ao motorista
          </p>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          style={{ width: "100%", maxWidth: 340 }}
        >
          {/* Status badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <StatusBadge
              label={isUsed ? "Passagem Já Utilizada" : "Pronto para Validação"}
              kind={isUsed ? "primary" : "success"}
            />
          </div>

          {/* QR Code card */}
          <div
            style={{
              background: DS.surface,
              borderRadius: 24,
              padding: "24px 20px",
              boxShadow: DS.shadowMd,
              border: `1px solid ${DS.border}`,
              marginBottom: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* QR Code Real Gerado */}
            <div style={{ marginBottom: 16 }}>
              <QRCodeRenderer value={credentialRef} size={190} altText="QR Code de Embarque" />
            </div>

            {/* Reference code resumido */}
            <p
              style={{
                margin: "0 0 16px",
                fontSize: 12,
                color: DS.text2,
                fontFamily: "monospace",
                letterSpacing: "1px",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              Ref: {credentialRef.slice(0, 16)}...
            </p>

            {/* Passenger info */}
            <div
              style={{
                width: "100%",
                borderTop: `1px solid ${DS.border}`,
                paddingTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <InfoRow icon="👤" label="Passageiro" value={passengerName} />
              <InfoRow icon="💺" label="Poltrona" value={seatNumber} />
              <InfoRow icon="🚌" label="Itinerário" value={`${departureCity} → ${arrivalCity}`} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer CTA */}
      <div
        style={{
          padding: "0 24px 36px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <BtnPrimary
          label="Voltar para a passagem"
          onClick={() => nav("/passagem")}
        />
      </div>
    </Screen>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const DS = useDS();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: DS.text3,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: DS.text1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
