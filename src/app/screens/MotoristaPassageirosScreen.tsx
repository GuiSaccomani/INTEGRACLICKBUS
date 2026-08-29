import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

export function MotoristaPassageirosScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { textSize } = useA11y();

  const titleSize = textSize === "xl" ? 22 : textSize === "large" ? 20 : 18;

  const passengers = [
    { id: 1, name: "Marcos Oliveira", status: "Embarcado", bag: "Bagagem identificada" },
    { id: 2, name: "Ana Costa", status: "Aguardando embarque", bag: null },
    { id: 3, name: "João Silva", status: "Embarcado", bag: "Bagagem aguardando identificação" },
    { id: 4, name: "Maria Fernanda", status: "Aguardando embarque", bag: null },
  ];

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Lista de Passageiros" onBack={() => nav("/motorista/home")} />

      <div style={{ padding: "16px 20px 30px" }}>
        
        {passengers.map((p, i) => {
          const isEmbarcado = p.status === "Embarcado";
          const isBagOK = p.bag === "Bagagem identificada";
          const isBagWait = p.bag === "Bagagem aguardando identificação";

          return (
            <div key={p.id} style={{
              background: DS.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: `1px solid ${isEmbarcado ? DS.success : DS.border}`,
              boxShadow: DS.shadowXs,
            }}>
              <p style={{ margin: "0 0 4px", fontSize: titleSize, fontWeight: 800, color: DS.text1 }}>
                {p.name}
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: isEmbarcado ? DS.success : DS.text3 }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: isEmbarcado ? DS.success : DS.text2 }}>
                  {p.status}
                </span>
              </div>

              {p.bag && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, background: isBagOK ? DS.successLight : DS.primaryLight, padding: "6px 10px", borderRadius: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="7" width="16" height="12" rx="2" stroke={isBagOK ? DS.success : DS.primary} strokeWidth="2.5" />
                    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={isBagOK ? DS.success : DS.primary} strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 600, color: isBagOK ? DS.success : DS.primary }}>
                    {p.bag}
                  </span>
                </div>
              )}
            </div>
          );
        })}

      </div>
    </Screen>
  );
}
