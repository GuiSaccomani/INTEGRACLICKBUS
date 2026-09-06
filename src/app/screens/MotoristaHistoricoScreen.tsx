import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader, StatusBadge } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { driverApi } from "../../services/api";
import { getStoredUserId } from "../../services/session";
import { cityOf, formatTripDateFull } from "../../services/format";

interface DriverTrip {
  tripId: string;
  tripDate?: string;
  tripDeparture?: string;
  tripArrival?: string;
  tripOccupation?: string;
}

export function MotoristaHistoricoScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { textSize } = useA11y();

  const titleSize = textSize === "xl" ? 18 : textSize === "large" ? 16 : 14;

  const [history, setHistory] = useState<DriverTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTrips() {
      const driverId = getStoredUserId();
      if (!driverId) {
        if (active) {
          setLoading(false);
          setLoadError("Sessão de motorista não encontrada.");
        }
        return;
      }

      try {
        const { trips } = await driverApi.getTrips(driverId);
        if (active) setHistory(Array.isArray(trips) ? trips : []);
      } catch (err: any) {
        if (active) setLoadError(err?.message || "Não foi possível carregar as viagens.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTrips();
    return () => { active = false; };
  }, []);

  // O schema não possui coluna de situação: derivada da data da viagem
  const tripStatus = (tripDate?: string): { label: string; kind: "success" | "primary" | "neutral" } => {
    if (!tripDate) return { label: "Sem data", kind: "neutral" };
    const date = new Date(tripDate);
    if (Number.isNaN(date.getTime())) return { label: "Sem data", kind: "neutral" };
    return date.getTime() < Date.now()
      ? { label: "Concluída", kind: "success" }
      : { label: "Programada", kind: "primary" };
  };

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Histórico da Viagem" onBack={() => nav("/motorista/home")} />

      <div style={{ padding: "16px 20px 30px" }}>
        <p style={{ margin: "0 0 16px", fontSize: titleSize, fontWeight: 700, color: DS.text2 }}>
          Viagens operadas recentemente
        </p>

        {(loading || loadError || history.length === 0) && (
          <div style={{
            background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}`,
            padding: "32px 20px", textAlign: "center", boxShadow: DS.shadowXs,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: loadError ? DS.warning : DS.text3, fontWeight: 500, lineHeight: 1.4 }}>
              {loading
                ? "Carregando viagens..."
                : loadError || "Nenhuma viagem operada por este motorista."}
            </p>
          </div>
        )}

        {history.map(item => {
          const st = tripStatus(item.tripDate);
          return (
            <div key={item.tripId} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "16px",
              background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}`,
              marginBottom: 12, boxShadow: DS.shadowXs,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: DS.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={DS.text3} strokeWidth="2.5" />
                  <path d="M12 6v6l4 2" stroke={DS.text3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: titleSize, fontWeight: 800, color: DS.text1 }}>
                  {cityOf(item.tripDeparture)} → {cityOf(item.tripArrival)}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: DS.text2, fontWeight: 600 }}>
                  {formatTripDateFull(item.tripDate)}
                </p>
              </div>
              <StatusBadge label={st.label} kind={st.kind} />
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
