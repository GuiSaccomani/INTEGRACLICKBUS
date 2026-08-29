import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader, StatusBadge } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

export function MotoristaListaBagagensScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { textSize } = useA11y();

  const titleSize = textSize === "xl" ? 18 : textSize === "large" ? 16 : 14;

  const BAGGAGES = [
    { id: "1023", pax: "Guilherme Santos", seat: "18", status: "Embarcada", color: "Azul" },
    { id: "1024", pax: "Marcos Oliveira", seat: "04", status: "Embarcada", color: "Preta" },
    { id: "1025", pax: "Juliana Silva", seat: "22", status: "Pendente", color: "Vermelha" },
  ];

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Lista de Bagagens" onBack={() => nav("/motorista/home")} />

      <div style={{ padding: "16px 20px 30px" }}>
        <p style={{ margin: "0 0 16px", fontSize: titleSize, fontWeight: 700, color: DS.text2 }}>
          Bagagens da viagem atual
        </p>

        {BAGGAGES.map((item, i) => (
          <div key={item.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "16px",
            background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`,
            marginBottom: 12, boxShadow: DS.shadowXs,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="7" width="16" height="12" rx="2" stroke={item.status === "Embarcada" ? DS.primary : DS.text3} strokeWidth="2.2" />
                <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={item.status === "Embarcada" ? DS.primary : DS.text3} strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: titleSize, fontWeight: 800, color: DS.text1 }}>
                Tag #{item.id} ({item.color})
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: DS.text2, fontWeight: 600 }}>
                Passageiro: {item.pax}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: DS.text3, fontWeight: 500 }}>
                Assento {item.seat}
              </p>
            </div>
            <StatusBadge label={item.status} kind={item.status === "Embarcada" ? "success" : "warning"} />
          </div>
        ))}
      </div>
    </Screen>
  );
}
