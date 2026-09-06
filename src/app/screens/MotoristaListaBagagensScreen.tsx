import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader, StatusBadge } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { driverApi, luggageApi } from "../../services/api";
import { getStoredUserId } from "../../services/session";
import { shortId } from "../../services/format";

interface BaggageRow {
  baggageId: string;
  passengerName: string;
  seat: number;
  isBoarded: boolean;
}

export function MotoristaListaBagagensScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { textSize } = useA11y();

  const titleSize = textSize === "xl" ? 18 : textSize === "large" ? 16 : 14;

  const [baggages, setBaggages] = useState<BaggageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTripBaggages() {
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
        const currentTrip = Array.isArray(trips) && trips.length > 0 ? trips[0] : null;
        if (!currentTrip?.tripId) {
          if (active) setLoadError("Nenhuma viagem atribuída a este motorista.");
          return;
        }

        const { passengers } = await driverApi.getTripPassengers(currentTrip.tripId);

        // A API não expõe as bagagens de uma viagem inteira: agregamos por passagem.
        // Só consultamos quem a própria API já indicou possuir bagagem.
        const withBaggage = (passengers || []).filter(p => p.baggageCount > 0);

        const results = await Promise.all(
          withBaggage.map(async (p) => {
            try {
              const { luggages } = await luggageApi.getByTicket(p.ticketId);
              return (luggages || []).map<BaggageRow>(bag => ({
                baggageId: bag.baggageId,
                passengerName: p.passengerName,
                seat: p.seat,
                isBoarded: p.isBoarded,
              }));
            } catch {
              return [] as BaggageRow[];
            }
          })
        );

        if (active) {
          setBaggages(results.flat().sort((a, b) => a.seat - b.seat));
        }
      } catch (err: any) {
        if (active) setLoadError(err?.message || "Não foi possível carregar as bagagens da viagem.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTripBaggages();
    return () => { active = false; };
  }, []);

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Lista de Bagagens" onBack={() => nav("/motorista/home")} />

      <div style={{ padding: "16px 20px 30px" }}>
        <p style={{ margin: "0 0 16px", fontSize: titleSize, fontWeight: 700, color: DS.text2 }}>
          Bagagens da viagem atual
          {!loading && !loadError && baggages.length > 0 && ` · ${baggages.length} volume(s)`}
        </p>

        {(loading || loadError || baggages.length === 0) && (
          <div style={{
            background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`,
            padding: "32px 20px", textAlign: "center", boxShadow: DS.shadowXs,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: loadError ? DS.warning : DS.text3, fontWeight: 500, lineHeight: 1.4 }}>
              {loading
                ? "Carregando bagagens..."
                : loadError || "Nenhuma bagagem registrada nesta viagem."}
            </p>
          </div>
        )}

        {baggages.map(item => {
          const statusLabel = item.isBoarded ? "Embarcada" : "Pendente";
          const accent = item.isBoarded ? DS.primary : DS.text3;
          return (
            <div key={item.baggageId} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "16px",
              background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`,
              marginBottom: 12, boxShadow: DS.shadowXs,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="7" width="16" height="12" rx="2" stroke={accent} strokeWidth="2.2" />
                  <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: titleSize, fontWeight: 800, color: DS.text1, fontFamily: "monospace" }}>
                  {shortId(item.baggageId, 12)}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: DS.text2, fontWeight: 600 }}>
                  Passageiro: {item.passengerName || "--"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: DS.text3, fontWeight: 500 }}>
                  Assento {item.seat ?? "--"}
                </p>
              </div>
              <StatusBadge label={statusLabel} kind={item.isBoarded ? "success" : "warning"} />
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
