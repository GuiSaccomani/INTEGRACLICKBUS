import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, StatusBadge, BtnPrimary, BtnGhost } from "../components/MobileLayout";

export function PassagemValidadaScreen() {
  const DS = useDS();
  const nav = useNavigate();
  return (
    <Screen bg={DS.bg}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "52px 24px 0" }}>
        {/* Check de sucesso */}
        <div style={{ position: "relative", marginBottom: 24, flexShrink: 0 }}>
          {[1, 2].map(i => (
            <motion.div key={i}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.35, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${DS.success}` }}
            />
          ))}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: `linear-gradient(135deg, ${DS.success}, #22a84a)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 12px 40px rgba(5,150,105,0.35)`,
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <motion.path d="M5 12l4 4 10-10" stroke="white" strokeWidth="2.8"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 0.25, duration: 0.45 }}
              />
            </svg>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ textAlign: "center", marginBottom: 28 }}
        >
          <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 900, color: DS.text1, letterSpacing: "-0.8px" }}>
            Embarque confirmado
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: DS.text2 }}>Seu acesso foi validado com sucesso.</p>
        </motion.div>

        {/* Dois cards conectados */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          style={{ width: "100%", marginBottom: 20 }}
        >
          {/* Card Passagem */}
          <div style={{
            background: DS.surface,
            border: `1px solid ${DS.border}`,
            borderRadius: "12px 12px 0 0",
            padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke={DS.primary} strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke={DS.primary} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="14" r="1.5" fill={DS.primary} />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: DS.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Passagem</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: DS.text1 }}>São Paulo → Rio de Janeiro</p>
                </div>
              </div>
              <StatusBadge label="Validada" kind="success" />
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[{ l: "Horário", v: "14:30" }, { l: "Assento", v: "18" }, { l: "Classe", v: "Executivo" }].map(f => (
                <div key={f.l}>
                  <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 600, textTransform: "uppercase" }}>{f.l}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: DS.text1 }}>{f.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Linha de conexão */}
          <div style={{ display: "flex", alignItems: "center", padding: "0 20px", background: DS.surface, borderLeft: `1px solid ${DS.border}`, borderRight: `1px solid ${DS.border}` }}>
            <div style={{ flex: 1, height: 1, background: DS.border }} />
            <div style={{ margin: "0 10px", padding: "6px 12px", borderRadius: 100, background: DS.bg, border: `1px solid ${DS.border}` }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: DS.text2, letterSpacing: "0.5px" }}>VINCULADA AUTOMATICAMENTE</p>
            </div>
            <div style={{ flex: 1, height: 1, background: DS.border }} />
          </div>

          {/* Card Bagagem */}
          <div style={{
            background: DS.surface,
            border: `1px solid ${DS.border}`,
            borderTop: "none",
            borderRadius: "0 0 12px 12px",
            padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.success} strokeWidth="1.5" />
                    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.success} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: DS.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Bagagem</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: DS.text1 }}>Bagagem 01</p>
                </div>
              </div>
              <StatusBadge label="Registrada" kind="success" />
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[{ l: "ID", v: "IN-20481" }, { l: "NFC", v: "Ativo" }].map(f => (
                <div key={f.l}>
                  <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 600, textTransform: "uppercase" }}>{f.l}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: DS.text1 }}>{f.v}</p>
                </div>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 12, color: DS.success, fontWeight: 600 }}>
              ✓ Bagagem vinculada à viagem automaticamente.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.35 }}
        style={{ padding: "12px 24px 44px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}
      >
        <BtnPrimary
          label="Ver minhas bagagens"
          onClick={() => nav("/bagagens")}
        />
        <BtnGhost
          label="Voltar para a home"
          onClick={() => nav("/home")}
        />
      </motion.div>
    </Screen>
  );
}
