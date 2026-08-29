import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, BackHeader, StatusBadge, BtnPrimary, BtnGhost } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

function QRCodeSVG({ size = 160 }: { size?: number }) {
  const c = size / 25;
  const modules: [number, number][] = [
    [8,0],[9,0],[11,0],[13,0],[14,0],[8,1],[10,1],[12,1],[14,1],[8,2],[9,2],[11,2],[13,2],
    [8,3],[10,3],[11,3],[14,3],[8,4],[9,4],[10,4],[12,4],[14,4],
    [0,8],[1,8],[2,8],[4,8],[6,8],[8,8],[9,8],[11,8],[13,8],[14,8],[16,8],[18,8],[20,8],[22,8],[24,8],
    [0,9],[3,9],[5,9],[7,9],[10,9],[12,9],[15,9],[17,9],[19,9],[21,9],[23,9],
    [1,10],[2,10],[4,10],[6,10],[8,10],[11,10],[13,10],[14,10],[16,10],[18,10],[22,10],[24,10],
    [0,11],[3,11],[5,11],[7,11],[9,11],[12,11],[15,11],[17,11],[20,11],[23,11],[24,11],
    [1,12],[4,12],[6,12],[8,12],[10,12],[11,12],[13,12],[16,12],[18,12],[21,12],[22,12],
    [8,15],[10,15],[12,15],[14,15],[17,15],[19,15],[21,15],[23,15],
    [8,16],[9,16],[11,16],[13,16],[16,16],[18,16],[20,16],[22,16],[24,16],
    [0,18],[1,18],[3,18],[4,18],[6,18],[0,19],[2,19],[5,19],[7,19],
    [1,20],[3,20],[4,20],[6,20],[0,21],[2,21],[5,21],[7,21],[9,21],[11,21],[13,21],
    [0,22],[1,22],[3,22],[6,22],[8,22],[10,22],[12,22],[14,22],
    [2,23],[4,23],[5,23],[7,23],[9,23],[11,23],[13,23],[15,23],[18,23],[20,23],[24,23],
    [0,24],[1,24],[3,24],[5,24],[6,24],[8,24],[10,24],[12,24],[16,24],[17,24],[19,24],[21,24],[23,24],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      <rect x={0} y={0} width={c*7} height={c*7} fill="black" />
      <rect x={c} y={c} width={c*5} height={c*5} fill="white" />
      <rect x={c*2} y={c*2} width={c*3} height={c*3} fill="black" />
      <rect x={c*18} y={0} width={c*7} height={c*7} fill="black" />
      <rect x={c*19} y={c} width={c*5} height={c*5} fill="white" />
      <rect x={c*20} y={c*2} width={c*3} height={c*3} fill="black" />
      <rect x={0} y={c*18} width={c*7} height={c*7} fill="black" />
      <rect x={c} y={c*19} width={c*5} height={c*5} fill="white" />
      <rect x={c*2} y={c*20} width={c*3} height={c*3} fill="black" />
      {modules.map(([x, y], i) => (
        <rect key={i} x={x*c} y={y*c} width={c} height={c} fill="black" />
      ))}
    </svg>
  );
}

const TIMELINE_STEPS = [
  { label: "Passagem confirmada", sub: "Compra identificada",          done: true  },
  { label: "Check-in realizado",  sub: "Passageiro confirmado",        done: true  },
  { label: "Embarque",            sub: "Aguardando validação NFC",     done: false },
  { label: "Bagagem",             sub: "Será registrada automaticamente", done: false },
];

export function PassagemDigitalScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();
  const [flipped, setFlipped] = useState(false);

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Minha Passagem" onBack={() => nav("/home")} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "14px 16px 0" }}>
          {/* Badge segurança */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 14 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z" stroke={DS.success} strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke={DS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: DS.success, letterSpacing: "0.3px" }}>
              Credencial protegida · Validação segura
            </span>
          </div>

          {/* 3D Flip card */}
          <div style={{ perspective: "1200px", width: "100%", height: 328, marginBottom: 16 }}>
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ transformStyle: "preserve-3d", width: "100%", height: "100%", position: "relative" }}
            >
              {/* FRONT */}
              <div style={{
                backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
                position: "absolute", inset: 0, borderRadius: 12, overflow: "hidden", boxShadow: DS.shadowMd,
                border: `1px solid ${DS.border}`,
              }}>
                <div style={{
                  background: DS.surface,
                  borderBottom: `1px dashed ${DS.border}`,
                  padding: "24px 20px 22px", position: "relative", overflow: "hidden",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>Passageiro</p>
                      <p style={{ margin: "3px 0 0", fontSize: 17, fontWeight: 800, color: DS.text1, letterSpacing: "-0.3px" }}>Guilherme Santos</p>
                    </div>
                    <StatusBadge label="Pronto" kind="success" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 10, color: DS.text3 }}>ORIGEM</p>
                      <p style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 900, color: DS.text1, letterSpacing: "-0.6px" }}>SP</p>
                      <p style={{ margin: "1px 0 0", fontSize: 11, color: DS.text2 }}>São Paulo</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: 9, color: DS.text3, marginTop: 2 }}>~5h30</span>
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 10, color: DS.text3 }}>DESTINO</p>
                      <p style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 900, color: DS.text1, letterSpacing: "-0.6px" }}>RJ</p>
                      <p style={{ margin: "1px 0 0", fontSize: 11, color: DS.text2 }}>Rio de Janeiro</p>
                    </div>
                  </div>
                </div>
                <div style={{ background: DS.bg, padding: "14px 20px 16px" }}>
                  <div style={{ display: "flex", marginBottom: 12 }}>
                    {[
                      { label: "Data", value: "21 AGO" },
                      { label: "Horário", value: "14:30" },
                      { label: "Assento", value: "18" },
                      { label: "Classe", value: "Exec." },
                    ].map((f, i, a) => (
                      <div key={f.label} style={{ flex: 1, textAlign: "center", borderRight: i < a.length - 1 ? `1px solid ${DS.border}` : "none" }}>
                        <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase" }}>{f.label}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 800, color: DS.text1 }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={DS.text3} strokeWidth="2" />
                      <circle cx="12" cy="9" r="2.5" stroke={DS.text3} strokeWidth="2" />
                    </svg>
                    <span style={{ fontSize: 12, color: DS.text2 }}>Terminal Novo Rio · Plataforma 4</span>
                  </div>
                </div>
              </div>

              {/* BACK — QR Code */}
              <div style={{
                backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
                position: "absolute", inset: 0, transform: "rotateY(180deg)",
                borderRadius: 12, overflow: "hidden", boxShadow: DS.shadowMd,
                background: DS.surface, border: `1px solid ${DS.border}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px",
              }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: DS.text1 }}>QR Code alternativo</p>
                <p style={{ margin: "0 0 14px", fontSize: 11, color: DS.text3 }}>Use se NFC não estiver disponível</p>
                <div style={{ borderRadius: 12, padding: 10, background: "#fff", boxShadow: DS.shadowSm, border: `1px solid ${DS.border}` }}>
                  <QRCodeSVG size={155} />
                </div>
                <p style={{ margin: "12px 0 0", fontSize: 12, fontWeight: 700, color: DS.text1, letterSpacing: "2px" }}>IN-4829-RJ-21</p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: DS.text3 }}>Válido 21/08 · 14:30</p>
              </div>
            </motion.div>
          </div>

          {/* ── PRÓXIMO PASSO ── */}
          <div style={{
            background: DS.surface,
            border: `1px solid ${DS.border}`,
            borderRadius: 12, padding: "18px 18px 16px",
            marginBottom: 16, boxShadow: DS.shadowXs,
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: DS.primary, letterSpacing: "0.6px", textTransform: "uppercase" }}>
              Próximo passo
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: DS.text1, lineHeight: 1.4 }}>
              Aproxime seu celular do celular do motorista.
            </p>

            {/* NFC badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: DS.success, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>NFC disponível</span>
            </div>

            <div style={{ marginTop: 10 }}>
              <BtnPrimary
                label="Embarcar com NFC"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="12" cy="14" r="2" fill="white" />
                  </svg>
                }
                onClick={() => {
                  triggerFeedback("neutral", "Aproxime seu celular do celular do motorista");
                  nav("/nfc");
                }}
              />
            </div>
            
            <div style={{ marginTop: 18, textAlign: "center" }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: DS.text2, fontWeight: 600 }}>
                Não consegue usar NFC?
              </p>
              <BtnGhost
                label={flipped ? "Voltar para NFC" : "Mostrar QR Code"}
                onClick={() => {
                  const newState = !flipped;
                  triggerFeedback("neutral", newState ? "Mostre este código ao motorista" : "");
                  setFlipped(newState);
                }}
              />
            </div>
          </div>

          {/* ── SUA JORNADA ── */}
          <div style={{
            background: DS.surface, borderRadius: 12, padding: "18px 18px",
            border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs,
            marginBottom: 20,
          }}>
            <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800, color: DS.text1 }}>Sua jornada</p>
            {TIMELINE_STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 14, position: "relative" }}>
                {/* Line */}
                {i < TIMELINE_STEPS.length - 1 && (
                  <div style={{
                    position: "absolute", left: 15, top: 28, width: 2, height: 32,
                    background: step.done ? DS.primary : DS.border,
                    borderRadius: 1,
                  }} />
                )}
                {/* Dot */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: step.done ? DS.primary : DS.surface,
                  border: `2px solid ${step.done ? DS.primary : DS.borderMd}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: i < TIMELINE_STEPS.length - 1 ? 16 : 0,
                  zIndex: 1,
                }}>
                  {step.done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l4 4 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: DS.borderMd }} />
                  )}
                </div>
                {/* Text */}
                <div style={{ paddingBottom: i < TIMELINE_STEPS.length - 1 ? 16 : 0, paddingTop: 4 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: step.done ? DS.text1 : DS.text3 }}>
                    {step.label}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: step.done ? DS.primary : DS.text3 }}>
                    {step.done ? "✓ " : "○ "}{step.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </Screen>
  );
}
