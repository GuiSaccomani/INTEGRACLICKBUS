import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BackHeader, BtnPrimary } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

function SuitcaseIllustration() {
  const DS = useDS();
  return (
    <svg width="140" height="130" viewBox="0 0 140 130" fill="none">
      <ellipse cx="70" cy="122" rx="42" ry="6" fill="rgba(123,44,191,0.06)" />
      <rect x="18" y="38" width="104" height="76" rx="12" fill={DS.primaryLight} stroke={DS.primaryMid} strokeWidth="2" />
      <path d="M46 38v-8a8 8 0 018-8h32a8 8 0 018 8v8" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="74" x2="122" y2="74" stroke={DS.primaryMid} strokeWidth="1.5" />
      <rect x="30" y="50" width="34" height="18" rx="5" fill="white" stroke={DS.primaryMid} strokeWidth="1" />
      <rect x="76" y="50" width="34" height="18" rx="5" fill="white" stroke={DS.primaryMid} strokeWidth="1" />
      <circle cx="28" cy="118" r="7" fill={DS.primaryMid} />
      <circle cx="28" cy="118" r="4" fill={DS.primary} opacity="0.5" />
      <circle cx="112" cy="118" r="7" fill={DS.primaryMid} />
      <circle cx="112" cy="118" r="4" fill={DS.primary} opacity="0.5" />
      {/* NFC tag */}
      <rect x="54" y="82" width="32" height="18" rx="5" fill={DS.primary} opacity="0.85" />
      <path d="M61 90.5C62.2 89 63.9 88.2 66 88.2s3.8.8 5 2.3" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="66" cy="92" r="1.2" fill="white" />
    </svg>
  );
}

export function RegistrarBagemScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = () => {
    setLoading(true);
    triggerFeedback("neutral", "Aproxime o celular da tag da bagagem");
    setTimeout(() => { 
      setLoading(false); 
      setDone(true); 
      triggerFeedback("success", "Bagagem vinculada ao passageiro");
    }, 2000);
  };

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Adicionar bagagem" onBack={() => nav("/bagagens")} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 20px" }}>
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ padding: "24px 0 12px" }}
              >
                <SuitcaseIllustration />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                style={{ textAlign: "center", marginBottom: 24 }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: DS.text1, letterSpacing: "-0.4px" }}>
                  Registrar bagagem
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: DS.text2, lineHeight: 1.5 }}>
                  Sua mala receberá uma tag digital NFC e ficará vinculada à sua viagem.
                </p>
              </motion.div>

              {/* Trip association info */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                style={{
                  width: "100%", background: DS.surface, borderRadius: 12,
                  padding: "14px 16px", marginBottom: 16,
                  border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs,
                }}>
                <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: DS.text3, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Será vinculada a
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1 }}>São Paulo → Rio de Janeiro</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: DS.text2 }}>21 AGO · 14:30 · Assento 18</p>
                  </div>
                </div>
              </motion.div>

              <div style={{ flex: 1 }} />

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ width: "100%", paddingBottom: 32 }}>
                <BtnPrimary
                  label={loading ? "Lendo tag..." : "Ler tag NFC"}
                  disabled={loading}
                  onClick={handle}
                  icon={
                    !loading && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="12" cy="14" r="2" fill="white" />
                      </svg>
                    )
                  }
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 14 }}
                style={{
                  width: 88, height: 88, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${DS.success}, #22a84a)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 10px 36px rgba(5,150,105,0.35)`,
                }}
              >
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                  <motion.path d="M5 12l4 4 10-10" stroke="white" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  />
                </svg>
              </motion.div>

              <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: DS.text1, letterSpacing: "-0.4px" }}>Bagagem vinculada ao passageiro</h2>
                <p style={{ margin: 0, fontSize: 14, color: DS.text2 }}>Pronto! A bagagem foi adicionada.</p>
              </div>

              <div style={{ background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`, padding: "14px 20px", width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Identificação", value: "IN-20481" },
                  { label: "NFC", value: "Ativo" },
                  { label: "QR Code", value: "Disponível" },
                  { label: "Status", value: "Registrada" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: DS.text2 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: DS.text1 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <BtnPrimary
                label="Ver minhas bagagens"
                onClick={() => nav("/bagagens")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
