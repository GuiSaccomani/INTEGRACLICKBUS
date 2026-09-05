import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, ScrollBody, StatusBadge, BtnPrimary } from "../components/MobileLayout";

function SuitcaseSVG() {
  const DS = useDS();
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      {/* Shadow */}
      <ellipse cx="80" cy="148" rx="50" ry="8" fill="rgba(123,44,191,0.08)" />

      {/* Main body */}
      <rect x="22" y="56" width="116" height="84" rx="14" fill={DS.primary} />
      <rect x="22" y="56" width="116" height="84" rx="14"
        fill="url(#bagGrad)" />

      {/* Handle */}
      <rect x="56" y="38" width="48" height="24" rx="10"
        stroke={DS.primary} strokeWidth="5" fill="none" />
      <rect x="56" y="38" width="48" height="24" rx="10"
        stroke={DS.secondary} strokeWidth="3" fill="none" opacity="0.5" />

      {/* Zipper line */}
      <rect x="22" y="96" width="116" height="6" fill="rgba(255,255,255,0.12)" />

      {/* Center divider */}
      <rect x="77" y="56" width="6" height="84" fill="rgba(255,255,255,0.08)" />

      {/* Pockets */}
      <rect x="34" y="66" width="36" height="24" rx="6" fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="90" y="66" width="36" height="24" rx="6" fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      {/* NFC symbol on front */}
      <g transform="translate(55, 103)">
        <path d="M7 17C9.2 14.7 12.4 13.3 16 13.3s6.8 1.4 9 3.7"
          stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M10 20.5C11.4 19 13.5 18.1 16 18.1s4.6.9 6 2.4"
          stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="16" cy="23.5" r="2" fill="rgba(255,255,255,0.8)" />
      </g>

      {/* Wheels */}
      <circle cx="42" cy="140" r="8" fill="#1A0533" />
      <circle cx="42" cy="140" r="5" fill="#2D0B66" />
      <circle cx="118" cy="140" r="8" fill="#1A0533" />
      <circle cx="118" cy="140" r="5" fill="#2D0B66" />

      {/* Shine */}
      <rect x="30" y="62" width="4" height="60" rx="2" fill="rgba(255,255,255,0.06)" />

      <defs>
        <linearGradient id="bagGrad" x1="22" y1="56" x2="138" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,255,255,0.1)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BagagemScreen() {
  const DS = useDS();
  const nav = useNavigate();

  return (
    <Screen bg="#F7F8FA">
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "52px 20px 14px",
        background: DS.surface,
        borderBottom: `1px solid ${DS.border}`,
        flexShrink: 0,
      }}>
        <button
          onClick={() => nav(-1)}
          style={{
            width: 40, height: 40, borderRadius: 12,
            border: `1.5px solid ${DS.border}`,
            background: DS.surface,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: DS.shadowXs,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke={DS.text1} strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: DS.text1 }}>
          Bagagem
        </span>
        <div style={{ width: 40 }} />
      </div>

      <ScrollBody style={{ padding: "0 20px" }}>
        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            display: "flex", justifyContent: "center",
            padding: "28px 0 16px",
          }}
        >
          <SuitcaseSVG />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          <h2 style={{
            margin: 0, fontSize: 24, fontWeight: 800,
            color: DS.text1, letterSpacing: "-0.5px",
          }}>
            Bagagem Registrada
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: DS.text2, lineHeight: 1.5 }}>
            Use esta credencial para retirar sua mala
          </p>
        </motion.div>

        {/* Mala 1 card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          style={{
            background: DS.surface,
            borderRadius: 12,
            padding: "18px 18px",
            boxShadow: DS.shadowMd,
            border: `1px solid ${DS.border}`,
            marginBottom: 14,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Color accent bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${DS.primary}, ${DS.secondary})`,
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
            {/* Icon */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="8" width="14" height="11" rx="2" stroke={DS.primary} strokeWidth="2" />
                <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="14" r="2" fill={DS.primary} opacity="0.8" />
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: DS.text1 }}>Mala 1</span>
                {/* NFC ativo badge */}
                <StatusBadge label="NFC ativo" kind="success" />
              </div>
              <p style={{ margin: 0, fontSize: 13, color: DS.text2, lineHeight: 1.4 }}>
                Associada à sua viagem
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: DS.border, margin: "16px 0" }} />

          {/* Details */}
          <div style={{ display: "flex", gap: 0 }}>
            {[
              { label: "Categoria", value: "Despachada" },
              { label: "Peso máx.", value: "23 kg" },
              { label: "Tag", value: "#AG4829" },
            ].map((item, i) => (
              <div key={item.label} style={{
                flex: 1, textAlign: "center",
                borderRight: i < 2 ? `1px solid ${DS.border}` : "none",
              }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: DS.text3, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {item.label}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: DS.text1 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            background: DS.surface,
            border: `1px solid ${DS.border}`,
            borderRadius: 12, padding: "16px 16px",
            display: "flex", gap: 12, alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="14" r="1.5" fill={DS.primary} />
              </svg>
            </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.primary }}>Tag Digital NFC</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: DS.text2, lineHeight: 1.45 }}>
              Utilize esta credencial para validar a retirada da bagagem no destino. Aproxime o celular do leitor na esteira.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          style={{ paddingBottom: 36 }}
        >
          <BtnPrimary
            label="Confirmar embarque"
            onClick={() => nav("/embarque-concluido")}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </motion.div>
      </ScrollBody>
    </Screen>
  );
}
