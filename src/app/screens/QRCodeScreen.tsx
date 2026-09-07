import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, BtnPrimary, StatusBadge, Fonts } from "../components/MobileLayout";
import { passengerApi, TicketDetails } from "../../services/api";
import { QRCodeRenderer } from "../components/QRCodeRenderer";
import { cityOf, formatTripDateShort } from "../../services/format";

export function QRCodeScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const location = useLocation();

  const [allTickets, setAllTickets] = useState<TicketDetails[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const targetTicketId = (location.state as any)?.ticketId;

  const loadTickets = useCallback(async () => {
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
        if (Array.isArray(userTickets) && userTickets.length > 0) {
          setAllTickets(userTickets);

          // Se veio um ticketId específico na navegação
          if (targetTicketId) {
            const idx = userTickets.findIndex(t => t.ticketId === targetTicketId);
            if (idx !== -1) {
              setSelectedIndex(idx);
              setLoading(false);
              return;
            }
          }

          // Prioriza o primeiro não utilizado
          const firstActiveIdx = userTickets.findIndex(t => t.used !== 1);
          setSelectedIndex(firstActiveIdx !== -1 ? firstActiveIdx : 0);
        }
      }
    } catch (err: any) {
      console.warn("Aviso ao carregar bilhetes:", err.message);
    } finally {
      setLoading(false);
    }
  }, [targetTicketId]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const ticketData = allTickets[selectedIndex] || null;
  const passengerName = ticketData?.passengerName || "Passageiro";
  const seatNumber = ticketData?.seat ? String(ticketData.seat) : "18";
  const departureCity = ticketData?.departure || "São Paulo";
  const arrivalCity = ticketData?.arrival || "Rio de Janeiro";
  const isUsed = ticketData?.used === 1;

  // Credencial segura: UT_HASH (64 hex chars) ou Ticket ID (32 hex chars)
  const credentialRef = ticketData?.utHash || ticketData?.ticketId || "INTEGRA-DEMO";

  // Próxima passagem não utilizada disponível para alternar
  const nextUnusedIdx = allTickets.findIndex(t => t.used !== 1);

  return (
    <Screen bg={DS.surface}>
      {/* Header */}
      <div
        style={{
          background: DS.surface,
          padding: "52px 20px 16px",
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
          <h1 style={{ fontFamily: Fonts.heading, margin: "0 0 2px", fontSize: 18, color: DS.text1 }}>
            QR Code de Embarque
          </h1>
          <p style={{ fontFamily: Fonts.body, margin: 0, fontSize: 12, color: DS.text2 }}>
            Apresente este código ao motorista
          </p>
        </div>
        <button
          onClick={loadTickets}
          title="Recarregar dados"
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DS.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 20px 30px",
          overflowY: "auto",
        }}
      >
        {/* ── SELETOR DE MÚLTIPLAS PASSAGENS ── */}
        {allTickets.length > 1 && (
          <div
            style={{
              width: "100%",
              maxWidth: 340,
              background: DS.bg,
              borderRadius: 14,
              padding: "10px 14px",
              marginBottom: 16,
              border: `1px solid ${DS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              disabled={selectedIndex <= 0}
              onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                background: selectedIndex > 0 ? DS.surface : "transparent",
                color: selectedIndex > 0 ? DS.primary : DS.text3,
                fontWeight: 800,
                cursor: selectedIndex > 0 ? "pointer" : "default",
              }}
            >
              ◀
            </button>

            <div style={{ textAlign: "center", flex: 1, padding: "0 8px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: DS.text3, textTransform: "uppercase" }}>
                Passagem {selectedIndex + 1} de {allTickets.length}
              </span>
              <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: DS.text1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {cityOf(departureCity)} → {cityOf(arrivalCity)}
              </p>
            </div>

            <button
              disabled={selectedIndex >= allTickets.length - 1}
              onClick={() => setSelectedIndex((i) => Math.min(allTickets.length - 1, i + 1))}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                background: selectedIndex < allTickets.length - 1 ? DS.surface : "transparent",
                color: selectedIndex < allTickets.length - 1 ? DS.primary : DS.text3,
                fontWeight: 800,
                cursor: selectedIndex < allTickets.length - 1 ? "pointer" : "default",
              }}
            >
              ▶
            </button>
          </div>
        )}

        <motion.div
          key={credentialRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* Status badge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <StatusBadge
              label={isUsed ? "Passagem Já Utilizada (Embarcada)" : "Pronto para Validação"}
              kind={isUsed ? "neutral" : "success"}
            />
          </div>

          {/* Alerta se o bilhete atual já foi utilizado e há outro livre */}
          {isUsed && nextUnusedIdx !== -1 && nextUnusedIdx !== selectedIndex && (
            <div
              style={{
                width: "100%",
                background: "rgba(245,158,11,0.12)",
                border: "1px solid #F59E0B",
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 14,
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#B45309" }}>
                Esta viagem já foi embarcada!
              </p>
              <button
                onClick={() => setSelectedIndex(nextUnusedIdx)}
                style={{
                  marginTop: 6,
                  padding: "4px 12px",
                  borderRadius: 6,
                  background: "#F59E0B",
                  color: "#FFF",
                  border: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Alternar para próxima passagem ativa
              </button>
            </div>
          )}

          {/* QR Code card */}
          <div
            style={{
              width: "100%",
              background: DS.surface,
              borderRadius: 20,
              padding: "20px",
              boxShadow: DS.shadowMd,
              border: `1px solid ${isUsed ? DS.border : DS.primary}`,
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: isUsed ? 0.75 : 1,
            }}
          >
            {/* QR Code Real Gerado */}
            <div style={{ marginBottom: 14 }}>
              <QRCodeRenderer value={credentialRef} size={180} altText="QR Code de Embarque" />
            </div>

            {/* Reference code resumido */}
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 11,
                fontFamily: "monospace",
                color: DS.text2,
                background: DS.bg,
                padding: "4px 10px",
                borderRadius: 6,
                letterSpacing: "0.5px",
              }}
            >
              HASH: {credentialRef.slice(0, 16)}...
            </p>

            {/* Linha divisória tracejada */}
            <div
              style={{
                width: "100%",
                borderTop: `1.5px dashed ${DS.border}`,
                margin: "0 0 14px",
              }}
            />

            {/* Detalhes do passageiro */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: DS.text2 }}>Passageiro:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: DS.text1 }}>{passengerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: DS.text2 }}>Poltrona:</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: DS.primary }}>{seatNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: DS.text2 }}>Trajeto:</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: DS.text1 }}>
                  {cityOf(departureCity)} → {cityOf(arrivalCity)}
                </span>
              </div>
            </div>
          </div>

          <BtnPrimary
            label="Ver Bilhete Completo"
            onClick={() => nav("/passagem", { state: { ticketId: ticketData?.ticketId } })}
          />
        </motion.div>
      </div>
    </Screen>
  );
}
