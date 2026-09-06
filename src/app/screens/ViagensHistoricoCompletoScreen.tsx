import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader, StatusBadge, Fonts } from "../components/MobileLayout";
import { passengerApi, type TicketDetails } from "../../services/api";
import { getStoredUserId } from "../../services/session";
import { cityOf, formatTripDateFull, ticketStatus } from "../../services/format";

// Os filtros refletem os estados reais do schema (TICKET_SOLD / TICKET_USED).
// Não existe conceito de viagem cancelada no banco.
type Filter = "Todas" | "Embarcadas" | "Pendentes";
const FILTERS: Filter[] = ["Todas", "Embarcadas", "Pendentes"];

export function ViagensHistoricoCompletoScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const [filter, setFilter] = useState<Filter>("Todas");

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
          setLoadError("Sessão não encontrada. Entre novamente.");
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

  const filtered = trips.filter(t => {
    if (filter === "Embarcadas") return t.used === 1;
    if (filter === "Pendentes") return t.used !== 1;
    return true;
  });

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Histórico de Viagens" onBack={() => nav(-1)} />

      <div style={{ display: "flex", gap: 10, padding: "16px 20px", overflowX: "auto", borderBottom: `1px solid ${DS.border}` }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            style={{
              padding: "8px 16px", borderRadius: 100, border: `1px solid ${filter === f ? DS.primary : DS.borderMd}`,
              background: filter === f ? DS.primaryLight : DS.surface,
              color: filter === f ? DS.primary : DS.text2,
              fontWeight: 600, fontSize: 13, fontFamily: Fonts.body, cursor: "pointer", whiteSpace: "nowrap"
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 40px" }}>
        <div style={{ background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs, overflow: "hidden" }}>
          {filtered.length > 0 ? filtered.map((item, i) => {
            const st = ticketStatus(item.sold, item.used);
            return (
              <div key={item.ticketId} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "16px",
                borderBottom: i < filtered.length - 1 ? `1px solid ${DS.border}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1, fontFamily: Fonts.heading }}>
                    {cityOf(item.departure)} → {cityOf(item.arrival)}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: DS.text2 }}>{formatTripDateFull(item.tripDate)}</p>
                </div>
                <StatusBadge label={st.label} kind={st.kind} />
              </div>
            );
          }) : (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ margin: 0, color: DS.text3, fontSize: 14, fontWeight: 500 }}>
                {loading ? "Carregando viagens..." : loadError || "Nenhuma viagem encontrada."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}
