import { useState } from "react";
import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader, StatusBadge, Fonts } from "../components/MobileLayout";

const ALL_HISTORY = [
  { id: 1, from: "São Paulo", to: "Campinas", date: "12 AGO 2026", status: "Concluída" },
  { id: 2, from: "Campinas", to: "Rio de Janeiro", date: "28 JUL 2026", status: "Concluída" },
  { id: 3, from: "Rio de Janeiro", to: "Belo Horizonte", date: "15 JUL 2026", status: "Cancelada" },
  { id: 4, from: "São Paulo", to: "Curitiba", date: "02 JUN 2026", status: "Concluída" },
];

export function ViagensHistoricoCompletoScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const [filter, setFilter] = useState<"Todas" | "Concluída" | "Cancelada">("Todas");

  const filtered = ALL_HISTORY.filter(h => filter === "Todas" || h.status === filter);

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Histórico de Viagens" onBack={() => nav(-1)} />
      
      <div style={{ display: "flex", gap: 10, padding: "16px 20px", overflowX: "auto", borderBottom: `1px solid ${DS.border}` }}>
        {["Todas", "Concluída", "Cancelada"].map(f => (
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
          {filtered.length > 0 ? filtered.map((item, i) => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "16px",
              borderBottom: i < filtered.length - 1 ? `1px solid ${DS.border}` : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1, fontFamily: Fonts.heading }}>{item.from} → {item.to}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: DS.text2 }}>{item.date}</p>
              </div>
              <StatusBadge label={item.status} kind={item.status === "Concluída" ? "success" : "error"} />
            </div>
          )) : (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ margin: 0, color: DS.text3, fontSize: 14, fontWeight: 500 }}>Nenhuma viagem encontrada.</p>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}
