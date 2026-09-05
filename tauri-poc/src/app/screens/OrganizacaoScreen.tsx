import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { DS, T, Screen, ScrollBody, BtnPrimary } from "../components/MobileLayout";

export function OrganizacaoScreen() {
  const nav = useNavigate();

  return (
    <Screen bg={DS.background}>
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
          <h1 style={{ ...T.hero, margin: "0 0 6px", fontSize: 26 }}>
            Portão definido
          </h1>
          <p style={{ ...T.body, margin: 0, fontSize: 15 }}>
            Organize-se para o embarque
          </p>
        </motion.div>
      </div>

      <ScrollBody style={{ padding: "20px 24px 36px" }}>
        {/* Main gate card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
          style={{ marginBottom: 20 }}
        >
          <div style={{
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: DS.shadowLg,
            border: `2px solid ${DS.primary}`,
            background: DS.surface,
          }}>
            {/* Purple gradient section */}
            <div style={{
              background: `linear-gradient(135deg, #4C1290 0%, ${DS.primary} 50%, ${DS.secondary} 100%)`,
              padding: "32px 28px",
              textAlign: "center",
              position: "relative",
            }}>
              {/* Decorative circles */}
              <div style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 130,
                height: 130,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
              }} />
              <div style={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
              }} />

              <p style={{
                margin: "0 0 12px",
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                position: "relative",
                zIndex: 1,
              }}>
                Seu portão de embarque
              </p>

              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 250, damping: 15 }}
                style={{ position: "relative", zIndex: 1 }}
              >
                <p style={{
                  margin: "0 0 6px",
                  fontSize: 72,
                  fontWeight: 800,
                  color: DS.surface,
                  letterSpacing: "-2px",
                  lineHeight: 1,
                }}>
                  4
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 500,
                }}>
                  Portão
                </p>
              </motion.div>
            </div>

            {/* Info section */}
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                {[
                  { icon: "🕐", label: "Horário", value: "14:30" },
                  { icon: "⏱️", label: "Tempo restante", value: "42 min", highlight: true },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    style={{
                      flex: 1,
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: item.highlight ? DS.alertFaint : "#FAFAFA",
                      border: item.highlight
                        ? `1.5px solid ${DS.alertMid}`
                        : `1px solid ${DS.border}`,
                    }}
                  >
                    <span style={{ fontSize: 20, display: "block", marginBottom: 6 }}>
                      {item.icon}
                    </span>
                    <p style={{
                      margin: "0 0 4px",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      color: DS.textTertiary,
                    }}>
                      {item.label}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 800,
                      letterSpacing: "-0.4px",
                      color: item.highlight ? DS.alert : DS.textPrimary,
                    }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Explanation card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ marginBottom: 24 }}
        >
          <p style={{
            ...T.label,
            margin: "0 0 10px 4px",
          }}>
            Como funciona
          </p>
          <div style={{
            background: DS.surface,
            borderRadius: 16,
            padding: "18px 20px",
            boxShadow: DS.shadowSm,
            border: `1px solid rgba(0,0,0,0.045)`,
          }}>
            <div style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              marginBottom: 14,
            }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: DS.primaryFaint,
                border: `1.5px solid ${DS.primaryMid}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 20 }}>🎯</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: "0 0 6px",
                  fontSize: 15,
                  fontWeight: 700,
                  color: DS.textPrimary,
                }}>
                  Distribuição inteligente
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  color: DS.textSecondary,
                  lineHeight: 1.5,
                }}>
                  Distribuímos os passageiros entre os portões para reduzir filas e melhorar o fluxo de embarque.
                </p>
              </div>
            </div>

            <div style={{
              padding: "12px 14px",
              background: DS.background,
              borderRadius: 10,
            }}>
              <p style={{
                margin: 0,
                fontSize: 13,
                color: DS.textSecondary,
                lineHeight: 1.5,
              }}>
                <span style={{ fontWeight: 600, color: DS.textPrimary }}>💡 Dica:</span>{" "}
                Chegue com 10 minutos de antecedência ao portão
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <BtnPrimary
            label="Ver QR Code de embarque"
            onClick={() => nav("/qrcode")}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5"
                  stroke="white" strokeWidth="1.8" fill="none" />
                <rect x="14" y="3" width="7" height="7" rx="1.5"
                  stroke="white" strokeWidth="1.8" fill="none" />
                <rect x="3" y="14" width="7" height="7" rx="1.5"
                  stroke="white" strokeWidth="1.8" fill="none" />
                <rect x="14" y="17" width="7" height="4" rx="1" fill="white" opacity="0.7" />
                <rect x="17" y="14" width="4" height="7" rx="1" fill="white" opacity="0.7" />
              </svg>
            }
          />
        </motion.div>
      </ScrollBody>
    </Screen>
  );
}
