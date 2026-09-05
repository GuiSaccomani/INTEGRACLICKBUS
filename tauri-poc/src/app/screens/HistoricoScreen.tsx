import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, ScrollBody, BackHeader, StatusBadge } from "../components/MobileLayout";

const TRIPS = [
  { id: 1, from: "São Paulo",       to: "Rio de Janeiro", date: "21 AGO 2025", time: "14:30", status: "Pronta para embarque" as const, kind: "success" as const },
  { id: 2, from: "São Paulo",       to: "Campinas",        date: "12 AGO 2025", time: "09:00", status: "Concluída"             as const, kind: "neutral" as const },
  { id: 3, from: "Campinas",        to: "Rio de Janeiro",  date: "28 JUL 2025", time: "16:30", status: "Concluída"             as const, kind: "neutral" as const },
  { id: 4, from: "Rio de Janeiro",  to: "São Paulo",        date: "15 JUL 2025", time: "08:45", status: "Concluída"             as const, kind: "neutral" as const },
  { id: 5, from: "São Paulo",       to: "Ribeirão Preto",  date: "02 JUN 2025", time: "11:00", status: "Concluída"             as const, kind: "neutral" as const },
];

export function HistoricoScreen() {
  const DS = useDS();
  const nav = useNavigate();
  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Histórico de viagens" onBack={() => nav("/home")} />

      <ScrollBody style={{ padding: "16px 16px 0" }}>
        {/* Summary chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, paddingLeft: 4 }}>
          {[
            { label: "5 viagens", bg: DS.primaryLight, color: DS.primary },
            { label: "2025", bg: DS.bg, color: DS.text2 },
          ].map(chip => (
            <span key={chip.label} style={{
              background: chip.bg, color: chip.color, borderRadius: 100,
              padding: "5px 12px", fontSize: 12, fontWeight: 700,
              border: `1px solid ${DS.borderMd}`,
            }}>
              {chip.label}
            </span>
          ))}
        </div>

        {TRIPS.map((trip, i) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            style={{
              background: DS.surface, borderRadius: 16,
              padding: "14px 16px", marginBottom: 10,
              boxShadow: DS.shadowXs, border: `1px solid ${DS.border}`,
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            {/* Route icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: i === 0 ? DS.primaryLight : DS.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="14" rx="3"
                  stroke={i === 0 ? DS.primary : DS.text3} strokeWidth="1.8" />
                <path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1"
                  stroke={i === 0 ? DS.primary : DS.text3} strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1, letterSpacing: "-0.2px" }}>
                  {trip.from}
                </p>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1, letterSpacing: "-0.2px" }}>
                  {trip.to}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: DS.text2 }}>{trip.date} · {trip.time}</p>
            </div>

            <StatusBadge label={trip.status} kind={trip.kind} />
          </motion.div>
        ))}

        <div style={{ height: 24 }} />
      </ScrollBody>
    </Screen>
  );
}
