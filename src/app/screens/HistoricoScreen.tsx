import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, ScrollBody, BackHeader, StatusBadge } from "../components/MobileLayout";
import { passengerApi, type TicketDetails } from "../../services/api";
import { getStoredUserId } from "../../services/session";
import { cityOf, formatTripDateFull, formatTripTime, ticketStatus } from "../../services/format";

export function HistoricoScreen() {
  const DS = useDS();
  const nav = useNavigate();

  const [trips, setTrips] = useState<TicketDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      const userId = getStoredUserId();
      if (!userId) {
        if (active) {
          setLoading(false);
          setLoadError("Sessão não encontrada. Entre novamente para ver seu histórico.");
        }
        return;
      }

      try {
        const result = await passengerApi.getUserTickets(userId);
        if (active) setTrips(Array.isArray(result) ? result : []);
      } catch (err: any) {
        if (active) setLoadError(err?.message || "Não foi possível carregar o histórico.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHistory();
    return () => { active = false; };
  }, []);

  // Anos presentes nas viagens retornadas pelo Oracle
  const yearSet = new Set<number>();
  for (const trip of trips) {
    if (!trip.tripDate) continue;
    const year = new Date(trip.tripDate).getFullYear();
    if (!Number.isNaN(year)) yearSet.add(year);
  }
  const years: number[] = Array.from(yearSet).sort((a: number, b: number) => b - a);

  const tripCountLabel = `${trips.length} ${trips.length === 1 ? "viagem" : "viagens"}`;

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Histórico de viagens" onBack={() => nav("/home")} />

      <ScrollBody style={{ padding: "16px 16px 0" }}>
        {/* Summary chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, paddingLeft: 4 }}>
          {[
            { label: loading ? "Carregando..." : tripCountLabel, bg: DS.primaryLight, color: DS.primary },
            ...(years.length > 0 ? [{ label: years.slice(0, 2).join(" · "), bg: DS.bg, color: DS.text2 }] : []),
          ].map(chip => (
            <span key={chip.label} style={{
              background: chip.bg, color: chip.color, borderRadius: 100,
              padding: "5px 12px", fontSize: 12, fontWeight: 700,
              border: `1px solid ${DS.borderMd}`,
            }}>
              {chip.label}
            </span>
          ))}
        </div>

        {!loading && loadError && (
          <div style={{
            background: DS.warningLight, border: `1px solid ${DS.warning}`,
            borderRadius: 12, padding: "14px 16px", marginBottom: 12,
          }}>
            <p style={{ margin: 0, fontSize: 12, color: DS.warning, lineHeight: 1.4 }}>{loadError}</p>
          </div>
        )}

        {!loading && !loadError && trips.length === 0 && (
          <div style={{
            background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}`,
            padding: "36px 20px", textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1 }}>Nenhuma viagem encontrada</p>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: DS.text2, lineHeight: 1.4 }}>
              Suas viagens aparecerão aqui após a compra de uma passagem.
            </p>
          </div>
        )}

        {trips.map((trip, i) => (
          <motion.div
            key={trip.ticketId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            style={{
              background: DS.surface, borderRadius: 16,
              padding: "14px 16px", marginBottom: 10,
              boxShadow: DS.shadowXs, border: `1px solid ${DS.border}`,
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            {/* Route icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: i === 0 ? DS.primaryLight : DS.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="14" rx="3"
                  stroke={i === 0 ? DS.primary : DS.text3} strokeWidth="1.8" />
                <path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1"
                  stroke={i === 0 ? DS.primary : DS.text3} strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1, letterSpacing: "-0.2px" }}>
                  {cityOf(trip.departure)}
                </p>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1, letterSpacing: "-0.2px" }}>
                  {cityOf(trip.arrival)}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: DS.text2 }}>
                {[formatTripDateFull(trip.tripDate), formatTripTime(trip.tripDate)]
                  .filter(part => part !== "--")
                  .join(" · ") || "--"}
              </p>
            </div>

            {(() => {
              const st = ticketStatus(trip.sold, trip.used);
              return <StatusBadge label={st.label} kind={st.kind} />;
            })()}
          </motion.div>
        ))}

        <div style={{ height: 24 }} />
      </ScrollBody>
    </Screen>
  );
}
