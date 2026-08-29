import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, BtnPrimary, StatusBadge, Fonts } from "../components/MobileLayout";

export function QRCodeScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <Screen bg={DS.surface}>
      {/* Header */}
      <div style={{
        background: DS.surface,
        padding: "54px 24px 20px",
        borderBottom: `1px solid ${DS.border}`,
        flexShrink: 0,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 style={{ fontFamily: Fonts.heading, margin: "0 0 6px", fontSize: 26, textAlign: "center", color: DS.text1 }}>
            QR Code de Embarque
          </h1>
          <p style={{ fontFamily: Fonts.body, margin: 0, fontSize: 15, textAlign: "center", color: DS.text2 }}>
            Mostre este código ao motorista.
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ width: "100%", maxWidth: 340 }}
        >
          {/* Status badge */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}>
            <StatusBadge label="Pronto para validação" kind="success" />
          </div>

          {/* QR Code card */}
          <div style={{
            background: DS.surface,
            borderRadius: 24,
            padding: "28px 24px",
            boxShadow: DS.shadowMd,
            border: `1px solid ${DS.border}`,
            marginBottom: 24,
          }}>
            {/* QR Code */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}>
              <motion.div
                key={refreshing ? "refreshing" : "normal"}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <TicketQR refreshing={refreshing} />
              </motion.div>
            </div>

            {/* Reference code */}
            <p style={{
              margin: "0 0 20px",
              fontSize: 13,
              color: DS.text3,
              fontFamily: "monospace",
              letterSpacing: "1.5px",
              fontWeight: 600,
              textAlign: "center",
            }}>
              CB-2026-05-19-0041
            </p>

            {/* Passenger info */}
            <div style={{
              borderTop: `1px solid ${DS.border}`,
              paddingTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}>
              <InfoRow icon="👤" label="Passageiro" value="Marcos Oliveira" />
              <InfoRow icon="💺" label="Poltrona" value="22A" />
              <InfoRow icon="🚪" label="Portão" value="4" highlight />
              <InfoRow icon="🕐" label="Horário" value="14:30" />
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 14,
              border: `1.5px solid ${DS.primaryMid}`,
              background: DS.primaryLight,
              color: DS.primary,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: refreshing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 12,
              opacity: refreshing ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {refreshing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: 16,
                    height: 16,
                    border: `2px solid ${DS.primaryMid}`,
                    borderTopColor: DS.primary,
                    borderRadius: "50%",
                  }}
                />
                Atualizando...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4v6h6M23 20v-6h-6"
                    stroke={DS.primary} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
                    stroke={DS.primary} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Atualizar QR Code
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Footer CTA */}
      <div style={{
        padding: "0 24px 36px",
        flexShrink: 0,
      }}>
        <BtnPrimary
          label="Validar embarque"
          onClick={() => nav("/validacao")}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>
    </Screen>
  );
}

function InfoRow({ icon, label, value, highlight }: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const DS = useDS();
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          color: DS.text3,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          {label}
        </p>
      </div>
      <p style={{
        margin: 0,
        fontSize: 16,
        fontWeight: 700,
        color: highlight ? DS.primary : DS.text1,
        letterSpacing: "-0.2px",
      }}>
        {value}
      </p>
    </div>
  );
}

function TicketQR({ refreshing }: { refreshing?: boolean }) {
  const DS = useDS();
  const modules: [number, number][] = [
    [12,12],[18,12],[24,12],[12,18],[24,18],[12,24],[18,24],[24,24],
    [78,12],[84,12],[90,12],[78,18],[90,18],[78,24],[84,24],[90,24],
    [12,78],[18,78],[24,78],[12,84],[24,84],[12,90],[18,90],[24,90],
    [36,12],[42,12],[48,12],[54,12],[36,18],[54,18],[48,24],[36,30],[42,30],[54,30],
    [36,42],[42,42],[54,42],[36,48],[48,48],[36,54],[42,54],[48,54],[54,54],
    [12,36],[18,36],[24,36],[12,42],[24,42],[12,48],[18,48],[12,54],[24,54],
    [66,36],[72,36],[78,36],[66,42],[78,42],[66,48],[72,54],[78,54],[90,54],
    [60,66],[72,66],[78,66],[84,66],[90,66],[60,72],[66,72],[84,72],[60,78],[72,78],[90,78],
    [60,84],[66,84],[78,84],[84,84],[60,90],[72,90],[84,90],[90,90],
    [36,60],[42,60],[48,60],[54,60],[36,66],[54,66],[36,72],[42,72],[48,72],[54,72],[36,78],[48,78],
    [36,84],[42,84],[54,84],[36,90],[42,90],[48,90],
  ];

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 106 106"
      fill="none"
      style={{ opacity: refreshing ? 0.4 : 1, transition: "opacity 0.3s" }}
    >
      <rect width="106" height="106" rx="12" fill="white" />
      <rect x="0.5" y="0.5" width="105" height="105" rx="11.5"
        stroke={DS.border} strokeWidth="1" fill="none" />

      {/* Finder patterns */}
      <rect x="8" y="8" width="30" height="30" rx="5" fill={DS.text1} />
      <rect x="11" y="11" width="24" height="24" rx="3" fill="white" />
      <rect x="14" y="14" width="18" height="18" rx="2" fill={DS.text1} />

      <rect x="68" y="8" width="30" height="30" rx="5" fill={DS.text1} />
      <rect x="71" y="11" width="24" height="24" rx="3" fill="white" />
      <rect x="74" y="14" width="18" height="18" rx="2" fill={DS.text1} />

      <rect x="8" y="68" width="30" height="30" rx="5" fill={DS.text1} />
      <rect x="11" y="71" width="24" height="24" rx="3" fill="white" />
      <rect x="14" y="74" width="18" height="18" rx="2" fill={DS.text1} />

      {/* Center brand */}
      <rect x="44" y="44" width="18" height="18" rx="4" fill={DS.primary} />
      <text
        x="53" y="55"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="7"
        fill="white"
        fontWeight="900"
        fontFamily="system-ui"
      >
        CB
      </text>

      {/* Data modules */}
      {modules.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="5" height="5" rx="1" fill={DS.text1} />
      ))}
    </svg>
  );
}
