import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { driverApi, TripPassenger } from "../../services/api";

export function MotoristaPassageirosScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { textSize } = useA11y();

  const titleSize = textSize === "xl" ? 22 : textSize === "large" ? 20 : 18;

  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Obtém o usuário logado (motorista) ou usa chave padrão
        let driverId = "00000000000000000000000000000001";
        const savedUser = localStorage.getItem("integra_user");
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed.userId) driverId = parsed.userId;
          } catch (_) {}
        }

        // 1. Busca as viagens do motorista
        const tripsRes = await driverApi.getTrips(driverId).catch(() => ({ trips: [] }));
        if (tripsRes.trips && tripsRes.trips.length > 0) {
          const tripId = tripsRes.trips[0].tripId;
          const passengersRes = await driverApi.getTripPassengers(tripId);
          setPassengers(passengersRes.passengers || []);
        } else {
          setPassengers([]);
        }
      } catch (err: any) {
        console.warn("Aviso ao carregar passageiros via API:", err.message);
        setError("Não foi possível carregar os passageiros da viagem no momento.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Lista de Passageiros" onBack={() => nav("/motorista/home")} />

      <div style={{ padding: "16px 20px 30px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ margin: 0, fontSize: 14, color: DS.text2 }}>Carregando lista de passageiros...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: 16, borderRadius: 12, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#DC2626", fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {!loading && !error && passengers.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}` }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: DS.text1 }}>Nenhum passageiro encontrado</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.text3 }}>Não há bilhetes vinculados para esta viagem no banco de dados.</p>
          </div>
        )}

        {!loading && passengers.map((p) => {
          const isEmbarcado = p.isBoarded || p.status === "Embarcado";
          const hasBag = p.hasBaggage || p.baggageCount > 0;

          return (
            <div key={p.ticketId} style={{
              background: DS.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: `1px solid ${isEmbarcado ? DS.success : DS.border}`,
              boxShadow: DS.shadowXs,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ margin: "0 0 4px", fontSize: titleSize, fontWeight: 800, color: DS.text1 }}>
                  {p.passengerName || "Passageiro sem nome"}
                </p>
                <span style={{ fontSize: 12, fontWeight: 800, color: DS.primary, background: DS.primaryLight, padding: "3px 8px", borderRadius: 6 }}>
                  Poltrona {p.seat}
                </span>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: isEmbarcado ? DS.success : DS.text3 }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: isEmbarcado ? DS.success : DS.text2 }}>
                  {isEmbarcado ? "Embarcado" : "Aguardando embarque"}
                </span>
              </div>

              {hasBag ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, background: DS.successLight, padding: "6px 10px", borderRadius: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.success} strokeWidth="2.5" />
                    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.success} strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: DS.success }}>
                    {p.baggageCount} {p.baggageCount === 1 ? "bagagem identificada" : "bagagens identificadas"}
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, background: DS.bg, padding: "6px 10px", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, color: DS.text3 }}>Sem bagagem despachada</span>
                </div>
              )}
            </div>
          );
        })}

      </div>
    </Screen>
  );
}
