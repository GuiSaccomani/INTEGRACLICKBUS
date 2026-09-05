import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { DS, T, Screen, Badge } from "../components/MobileLayout";

export function ValidacaoScreen() {
  const nav = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      nav("/");
    }, 4000);
    return () => clearTimeout(timer);
  }, [nav]);

  return (
    <Screen bg={DS.successFaint}>
      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 40px",
        textAlign: "center",
      }}>
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
          style={{ position: "relative", marginBottom: 40 }}
        >
          {/* Pulse rings */}
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.15, 0, 0.15],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              inset: -30,
              borderRadius: "50%",
              border: `3px solid ${DS.success}`,
              pointerEvents: "none",
            }}
          />

          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.4,
            }}
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: "50%",
              border: `3px solid ${DS.success}`,
              pointerEvents: "none",
            }}
          />

          {/* Main circle */}
          <div style={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: `linear-gradient(145deg, #1FA84C, ${DS.success})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(45,198,83,0.3)",
          }}>
            <motion.svg
              width="65"
              height="65"
              viewBox="0 0 24 24"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.path
                d="M4 13l5 5L20 7"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
              />
            </motion.svg>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <h1 style={{
            ...T.hero,
            fontSize: 32,
            margin: "0 0 12px",
          }}>
            Embarque validado
          </h1>
          <p style={{
            ...T.body,
            fontSize: 16,
            margin: "0 0 28px",
            lineHeight: 1.5,
            maxWidth: 280,
          }}>
            Tudo certo! Você pode embarcar no ônibus.
          </p>

          <Badge label="Boa viagem!" variant="success" icon="🎉" />
        </motion.div>

        {/* Trip details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          style={{ marginTop: 40 }}
        >
          <div style={{
            background: DS.surface,
            borderRadius: 18,
            padding: "18px 24px",
            boxShadow: DS.shadowMd,
            border: `1px solid rgba(0,0,0,0.06)`,
          }}>
            <p style={{
              margin: "0 0 12px",
              fontSize: 13,
              fontWeight: 700,
              color: DS.textPrimary,
              textAlign: "center",
            }}>
              São Paulo → Campinas
            </p>
            <div style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
            }}>
              <div style={{ textAlign: "center" }}>
                <p style={{
                  margin: "0 0 3px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: DS.textTertiary,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Poltrona
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: DS.textPrimary,
                  letterSpacing: "-0.3px",
                }}>
                  22A
                </p>
              </div>
              <div style={{
                width: 1,
                background: DS.border,
              }} />
              <div style={{ textAlign: "center" }}>
                <p style={{
                  margin: "0 0 3px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: DS.textTertiary,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Horário
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: DS.textPrimary,
                  letterSpacing: "-0.3px",
                }}>
                  14:30
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          padding: "0 24px 40px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 8,
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: 14,
              height: 14,
              border: `2px solid ${DS.textTertiary}`,
              borderTopColor: DS.textSecondary,
              borderRadius: "50%",
            }}
          />
          <span style={{
            fontSize: 13,
            color: DS.textSecondary,
            fontWeight: 500,
          }}>
            Retornando ao início...
          </span>
        </div>
      </motion.div>
    </Screen>
  );
}
