import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { DS, T, Screen, ScrollBody, BtnPrimary, Badge } from "../components/MobileLayout";

export function MinhasPassagensScreen() {
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
            Minhas Passagens
          </h1>
          <p style={{ ...T.body, margin: 0, fontSize: 15 }}>
            Suas viagens futuras
          </p>
        </motion.div>
      </div>

      <ScrollBody style={{ padding: "20px 24px 36px" }}>
        {/* Main trip card - destaque */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ marginBottom: 16 }}
        >
          <p style={{
            ...T.label,
            margin: "0 0 10px 4px",
            color: DS.primary,
          }}>
            Próxima viagem
          </p>
          <div style={{
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: DS.shadowLg,
            border: `1px solid rgba(0,0,0,0.05)`,
          }}>
            {/* Purple header */}
            <div style={{
              background: `linear-gradient(135deg, #4C1290 0%, ${DS.primary} 50%, ${DS.secondary} 100%)`,
              padding: "20px",
              position: "relative",
            }}>
              {/* Decorative circles */}
              <div style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: 0, position: "relative", zIndex: 1 }}>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: "0 0 2px",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}>
                    Origem
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 800,
                    color: DS.surface,
                    letterSpacing: "-0.5px",
                  }}>
                    São Paulo
                  </p>
                  <p style={{
                    margin: "3px 0 0",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.5)",
                  }}>
                    Terminal Tietê
                  </p>
                </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "0 8px",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6"
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p style={{
                    margin: 0,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.45)",
                    fontWeight: 500,
                  }}>
                    1h 40min
                  </p>
                </div>

                <div style={{ flex: 1, textAlign: "right" }}>
                  <p style={{
                    margin: "0 0 2px",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}>
                    Destino
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 800,
                    color: DS.surface,
                    letterSpacing: "-0.5px",
                  }}>
                    Campinas
                  </p>
                  <p style={{
                    margin: "3px 0 0",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.5)",
                  }}>
                    Rodoviária Central
                  </p>
                </div>
              </div>
            </div>

            {/* Trip details */}
            <div style={{ background: DS.surface }}>
              {/* Info grid */}
              <div style={{ display: "flex", borderBottom: `1px solid ${DS.border}` }}>
                {[
                  { icon: "📅", label: "Data", value: "Hoje" },
                  { icon: "🕐", label: "Horário", value: "14:30" },
                  { icon: "💺", label: "Assento", value: "22A" },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "16px 8px",
                      borderRight: i < arr.length - 1 ? `1px solid ${DS.border}` : "none",
                    }}
                  >
                    <span style={{ fontSize: 18, display: "block", marginBottom: 5 }}>
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
                      color: DS.textPrimary,
                    }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Company & status */}
              <div style={{
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <p style={{
                  margin: 0,
                  fontSize: 13,
                  color: DS.textSecondary,
                }}>
                  Viação Norte Expresso
                </p>
                <Badge label="Agendada" variant="alert" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Check-in CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          style={{ marginBottom: 28 }}
        >
          <BtnPrimary
            label="Realizar check-in"
            onClick={() => nav("/checkin")}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 11l3 3L22 4" stroke="white" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                  stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </motion.div>

        {/* Other trips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <p style={{
            ...T.label,
            margin: "0 0 10px 4px",
          }}>
            Outras viagens
          </p>

          <div style={{
            background: DS.surface,
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: DS.shadowSm,
            border: `1px solid rgba(0,0,0,0.045)`,
            marginBottom: 12,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}>
              <p style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: DS.textPrimary,
              }}>
                São Paulo → Rio de Janeiro
              </p>
              <Badge label="Confirmada" variant="success" />
            </div>
            <p style={{
              margin: "0 0 6px",
              fontSize: 13,
              color: DS.textSecondary,
            }}>
              Sábado, 24 de maio · 19:00
            </p>
            <p style={{
              margin: 0,
              fontSize: 12,
              color: DS.textTertiary,
            }}>
              Poltrona 15B
            </p>
          </div>
        </motion.div>
      </ScrollBody>
    </Screen>
  );
}
