import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, BackHeader } from "../components/MobileLayout";

function SuitcaseSVG() {
  const DS = useDS();
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <rect x="9" y="18" width="34" height="26" rx="5" fill={DS.primaryLight} stroke={DS.primaryMid} strokeWidth="1.8" />
      <path d="M18 18v-5a4 4 0 014-4h8a4 4 0 014 4v5" stroke={DS.primary} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9" y1="30" x2="43" y2="30" stroke={DS.primaryMid} strokeWidth="1.8" />
      <circle cx="19" cy="46" r="2.5" fill={DS.primary} opacity="0.5" />
      <circle cx="33" cy="46" r="2.5" fill={DS.primary} opacity="0.5" />
      {/* NFC */}
      <path d="M22 23.5C23.2 22.2 24.5 21.5 26 21.5s2.8.7 4 2" stroke={DS.primary} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24 25.5c.6-.7 1.2-1 2-1s1.4.3 2 1" stroke={DS.primary} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="26" cy="27" r="1.2" fill={DS.primary} />
    </svg>
  );
}

export function BagagensScreen() {
  const DS = useDS();
  const nav = useNavigate();

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Minhas bagagens" onBack={() => nav("/home")} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
        {/* Subtítulo vinculado */}
        <div style={{
          background: DS.primaryLight, border: `1.5px solid ${DS.primaryMid}`,
          borderRadius: 14, padding: "12px 14px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.primary }}>Suas bagagens</p>
            <p style={{ margin: "1px 0 0", fontSize: 12, color: DS.text2 }}>Vinculadas automaticamente à sua viagem.</p>
          </div>
        </div>

        {/* Card da bagagem */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onClick={() => nav("/bagagem-detalhe")}
          style={{
            background: DS.surface, borderRadius: 12,
            border: `1px solid ${DS.border}`, boxShadow: DS.shadowSm,
            padding: "16px 16px", marginBottom: 12, cursor: "pointer",
          }}
          whileTap={{ scale: 0.985 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <SuitcaseSVG />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: DS.text1 }}>Bagagem 01</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: DS.success, background: DS.successLight, borderRadius: 100, padding: "3px 10px" }}>
                  ✓ Registrada
                </span>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: DS.text2, fontFamily: "monospace" }}>ID: IN-20481</p>
            </div>
          </div>

          <div style={{ background: DS.bg, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${DS.border}` }}>
              <span style={{ fontSize: 12, color: DS.text2 }}>Viagem</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: DS.text1 }}>São Paulo → Rio de Janeiro</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${DS.border}` }}>
              <span style={{ fontSize: 12, color: DS.text2 }}>Status</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>✓ Registrada</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ fontSize: 12, color: DS.text2 }}>Identificação NFC</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: DS.success }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>Ativo</span>
              </div>
            </div>
          </div>

          <p style={{ margin: "12px 0 0", fontSize: 12, color: DS.primary, fontWeight: 600, textAlign: "center" }}>
            Esta bagagem será validada junto à sua viagem.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 10 }}>
            <span style={{ fontSize: 12, color: DS.text2 }}>Ver detalhes</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke={DS.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.div>

        {/* Adicionar nova */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          onClick={() => nav("/bagagem-nova")}
          style={{
            background: DS.surface, borderRadius: 12,
            border: `2px dashed ${DS.primaryMid}`,
            padding: "20px 16px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 14,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke={DS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.primary }}>Adicionar bagagem</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: DS.text2 }}>Registrar nova mala com NFC</p>
          </div>
        </motion.div>
      </div>

    </Screen>
  );
}
