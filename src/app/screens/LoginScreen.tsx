import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, LogoMark } from "../components/MobileLayout";

function Field({ label, type = "text", placeholder, value, onChange }: {
  label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
}) {
  const DS = useDS();
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", marginBottom: 7, fontSize: 13, fontWeight: 600, color: DS.text2 }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 56, padding: "0 16px", boxSizing: "border-box",
          borderRadius: 14, border: `2px solid ${focused ? DS.primary : DS.borderMd}`,
          background: focused ? DS.primaryLight : DS.surface,
          fontSize: 16, fontFamily: "'Inter', sans-serif", color: DS.text1, outline: "none",
          transition: "border-color 0.18s, background 0.18s",
          boxShadow: focused ? `0 0 0 4px rgba(123,44,191,0.07)` : "none",
        }}
      />
    </div>
  );
}

export function LoginScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => nav("/home"), 900);
  };

  return (
    <Screen bg={DS.surface}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ padding: "56px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}
      >
        <LogoMark size={52} />
        <h1 style={{ margin: "20px 0 6px", fontSize: 26, fontWeight: 800, color: DS.text1, letterSpacing: "-0.6px" }}>
          Bem-vindo de volta
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: DS.text2 }}>Entre para continuar sua jornada</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.42 }}
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px" }}
      >
        <Field label="CPF" placeholder="000.000.000-00" value={cpf} onChange={setCpf} />
        <Field label="Senha" type="password" placeholder="••••••••" value={senha} onChange={setSenha} />

        <div style={{ textAlign: "right", marginBottom: 28, marginTop: -4 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: DS.primary, fontFamily: "'Inter', sans-serif", padding: 0 }}>
            Esqueci minha senha
          </button>
        </div>

        {/* Main CTA */}
        <button
          onClick={handleLogin} disabled={loading}
          style={{
            width: "100%", height: 60, borderRadius: 18, border: "none",
            background: loading ? DS.primaryMid : `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
            color: "#fff", fontSize: 17, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Inter', sans-serif",
            boxShadow: loading ? "none" : DS.shadowPrimary,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "transform 0.1s",
          }}
          onPointerDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.975)"; }}
          onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
              style={{ width: 22, height: 22, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />
          ) : "Entrar"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
          <div style={{ flex: 1, height: 1, background: DS.border }} />
          <span style={{ fontSize: 12, color: DS.text3, fontWeight: 500 }}>ou</span>
          <div style={{ flex: 1, height: 1, background: DS.border }} />
        </div>

        {/* Biometric */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%", height: 56, borderRadius: 16,
            border: `1.5px solid ${DS.borderMd}`, background: DS.surface,
            color: DS.text1, fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Inter', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 1C9.24 1 7 3.24 7 6v1a5 5 0 0010 0V6c0-2.76-2.24-5-5-5z" stroke={DS.primary} strokeWidth="1.8" />
            <path d="M5 10.5C3.76 11.56 3 13.19 3 15v2a9 9 0 0018 0v-2c0-1.81-.76-3.44-2-4.5" stroke={DS.primary} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M9 15a3 3 0 006 0" stroke={DS.primary} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Entrar com biometria
        </button>

        {/* Driver Access */}
        <button
          onClick={() => nav("/motorista/home")}
          style={{
            width: "100%", height: 56, borderRadius: 16, marginTop: 12,
            border: `1.5px solid ${DS.borderMd}`, background: DS.surface,
            color: DS.text1, fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Inter', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2m14 0v1.5c0 .8-.7 1.5-1.5 1.5h-1c-.8 0-1.5-.7-1.5-1.5V17m4 0h-4M5 17v1.5C5 19.3 4.3 20 3.5 20h-1C1.7 20 1 19.3 1 18.5V17m4 0H1M6 6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v4H6V6z" stroke={DS.text3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Acesso Motorista
        </button>
      </motion.div>

      <div style={{ padding: "0 24px 40px", textAlign: "center", flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: 11, color: DS.text3 }}>
          Acesso seguro · Seus dados são criptografados
        </p>
      </div>
    </Screen>
  );
}
