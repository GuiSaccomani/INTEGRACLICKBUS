import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader, StatusBadge } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

export function MotoristaHistoricoScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { textSize } = useA11y();

  const titleSize = textSize === "xl" ? 18 : textSize === "large" ? 16 : 14;

  const HISTORY = [
    { id: 1, from: "São Paulo", to: "Campinas", date: "12 AGO 2026", status: "Concluída" },
    { id: 2, from: "Campinas", to: "Rio de Janeiro", date: "28 JUL 2026", status: "Concluída" },
    { id: 3, from: "Rio de Janeiro", to: "Belo Horizonte", date: "15 JUL 2026", status: "Concluída" },
  ];

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Histórico da Viagem" onBack={() => nav("/motorista/home")} />

      <div style={{ padding: "16px 20px 30px" }}>
        <p style={{ margin: "0 0 16px", fontSize: titleSize, fontWeight: 700, color: DS.text2 }}>
          Viagens operadas recentemente
        </p>

        {HISTORY.map((item, i) => (
          <div key={item.id} style={{
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
                {item.from} → {item.to}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: DS.text2, fontWeight: 600 }}>
                {item.date}
              </p>
            </div>
            <StatusBadge label={item.status} kind="success" />
          </div>
        ))}
      </div>
    </Screen>
  );
}
