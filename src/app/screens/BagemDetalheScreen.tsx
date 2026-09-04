import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, BackHeader, BtnPrimary } from "../components/MobileLayout";

function SuitcaseIllustration() {
  const DS = useDS();
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      {/* Sombra */}
      <ellipse cx="60" cy="108" rx="38" ry="6" fill="rgba(0,0,0,0.06)" />
      {/* Corpo da mala */}
      <rect x="18" y="32" width="84" height="66" rx="12" fill={DS.primaryLight} stroke={DS.primaryMid} strokeWidth="2" />
      {/* Faixa central */}
      <rect x="18" y="60" width="84" height="10" fill={DS.primaryMid} />
      {/* Alça */}
      <path d="M38 32v-10a8 8 0 018-8h28a8 8 0 018 8v10" stroke={DS.primary} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Rodas */}
      <circle cx="34" cy="100" r="6" fill={DS.primary} opacity="0.6" />
      <circle cx="86" cy="100" r="6" fill={DS.primary} opacity="0.6" />
      {/* Fechadura */}
      <rect x="52" y="56" width="16" height="14" rx="3" fill={DS.primary} opacity="0.8" />
      <circle cx="60" cy="51" r="4" stroke={DS.primary} strokeWidth="2" fill="none" opacity="0.8" />
      {/* NFC ondas */}
      <path d="M72 46C75 42 76 37 74 33" stroke={DS.primary} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.35" />
      <path d="M76 50C82 44 83 35 79 28" stroke={DS.primary} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.25" />
      <path d="M80 54C89 46 90 33 84 24" stroke={DS.primary} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.15" />
    </svg>
  );
}

const TIMELINE = [
  { label: "Registrada",          sub: "Bagagem identificada no sistema", done: true  },
  { label: "Vinculada à viagem",   sub: "SP → RJ · 21 AGO · 14:30",       done: true  },
  { label: "Em trânsito",          sub: "Aguardando embarque",             done: false },
  { label: "Retirada",             sub: "Confirme com NFC ao retirar",     done: false },
];

export function BagemDetalheScreen() {
  const DS = useDS();
  const nav = useNavigate();

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Bagagem 01" onBack={() => nav("/bagagens")} />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 0" }}>
        {/* Ilustração */}
        <div style={{
          background: DS.surface, borderRadius: 12,
          border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs,
          padding: "24px", display: "flex", flexDirection: "column", alignItems: "center",
          marginBottom: 16,
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
          >
            <SuitcaseIllustration />
          </motion.div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <motion.div
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: DS.success }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>NFC ativo</span>
          </div>
        </div>

        {/* Informações */}
        <div style={{
          background: DS.surface, borderRadius: 12,
          border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs,
          padding: "0 16px", marginBottom: 16,
        }}>
          {[
            { label: "ID da bagagem",      value: "IN-20481"                  },
            { label: "Viagem vinculada",   value: "São Paulo → Rio de Janeiro" },
            { label: "Data da viagem",     value: "21 AGO 2025 · 14:30"       },
            { label: "Status",             value: "✓ Registrada"              },
            { label: "Identificação",      value: "NFC ativo"                 },
          ].map((row, i, a) => (
            <div key={row.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "13px 0",
              borderBottom: i < a.length - 1 ? `1px solid ${DS.border}` : "none",
            }}>
              <span style={{ fontSize: 13, color: DS.text2 }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: row.value.startsWith("✓") ? DS.success : DS.text1 }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Segurança Digital Simplificada para o Passageiro */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          style={{
            background: DS.surface, borderRadius: 12,
            border: `1px solid ${DS.border}`,
            boxShadow: DS.shadowXs,
            padding: "14px 16px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: DS.primaryLight,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z" stroke={DS.primary} strokeWidth="2" strokeLinejoin="round" fill={DS.primaryLight} />
              <path d="M9 12l2 2 4-4" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.text1 }}>Bagagem Rastreada e Segura</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: DS.text2 }}>Identificação digital vinculada à sua passagem</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: DS.success, background: DS.successLight, padding: "3px 8px", borderRadius: 100 }}>
            Protegida
          </span>
        </motion.div>

        {/* Timeline */}
        <div style={{
          background: DS.surface, borderRadius: 12,
          border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs,
          padding: "16px 16px", marginBottom: 20,
        }}>
          <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 800, color: DS.text1 }}>Jornada da bagagem</p>
          {TIMELINE.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 14, position: "relative" }}>
              {i < TIMELINE.length - 1 && (
                <div style={{
                  position: "absolute", left: 15, top: 30, width: 2, height: 36,
                  background: step.done ? DS.primary : DS.border, borderRadius: 1,
                }} />
              )}
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: step.done ? DS.primary : DS.surface,
                border: `2px solid ${step.done ? DS.primary : DS.borderMd}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: i < TIMELINE.length - 1 ? 18 : 0, zIndex: 1,
              }}>
                {step.done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l4 4 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: DS.borderMd }} />
                )}
              </div>
              <div style={{ paddingBottom: i < TIMELINE.length - 1 ? 18 : 0, paddingTop: 4 }}>
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

      {/* Botão retirada */}
      <div style={{ padding: "12px 16px 44px", flexShrink: 0 }}>
        <BtnPrimary
          label="Retirar bagagem"
          onClick={() => nav("/bagagem-retirada")}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="14" r="1.5" fill="white" />
            </svg>
          }
        />
      </div>
    </Screen>
  );
}
