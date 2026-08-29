import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, LogoMark } from "../components/MobileLayout";

function Field({ label, type = "text", placeholder, value, onChange, error }: {
  label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  const DS = useDS();
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: DS.text2 }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 52, padding: "0 16px", boxSizing: "border-box",
          borderRadius: 13, border: `2px solid ${error ? DS.error : focused ? DS.primary : DS.borderMd}`,
          background: focused ? DS.primaryLight : DS.surface,
          fontSize: 15, fontFamily: "'Inter', sans-serif", color: DS.text1, outline: "none",
          transition: "border-color 0.18s, background 0.18s",
          boxShadow: focused ? `0 0 0 4px rgba(123,44,191,0.07)` : "none",
        }}
      />
      {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: DS.error }}>{error}</p>}
    </div>
  );
}

function formatCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

export function CriarContaScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [nasc, setNasc] = useState("");
  const [cel, setCel] = useState("");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Nome obrigatório";
    if (cpf.replace(/\D/g, "").length < 11) e.cpf = "CPF inválido";
    if (!nasc) e.nasc = "Data obrigatória";
    if (cel.replace(/\D/g, "").length < 10) e.cel = "Celular inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!email.includes("@")) e.email = "E-mail inválido";
    if (senha.length < 8) e.senha = "Mínimo 8 caracteres";
    if (senha !== confirma) e.confirma = "Senhas não coincidem";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (step === 1 && validateStep1()) { setErrors({}); setStep(2); }
    else if (step === 2 && validateStep2()) setSuccess(true);
  }

  function handleBack() {
    if (step === 2) { setErrors({}); setStep(1); }
    else nav("/");
  }

  if (success) {
    return (
      <Screen bg={DS.surface}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 16 }}
            style={{
              width: 88, height: 88, borderRadius: "50%",
              background: `linear-gradient(135deg, ${DS.success}, #22a84a)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 28, boxShadow: "0 12px 40px rgba(5,150,105,0.35)",
            }}
          >
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
              <motion.path d="M5 12l4 4 10-10" stroke="white" strokeWidth="2.8"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </svg>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ textAlign: "center" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, color: DS.text1, letterSpacing: "-0.8px" }}>
              Conta criada!
            </h1>
            <p style={{ margin: "0 0 32px", fontSize: 15, color: DS.text2, lineHeight: 1.6 }}>
              Bem-vindo, {nome.split(" ")[0]}! Sua conta foi criada com sucesso.
            </p>
            <button
              onClick={() => nav("/login")}
              style={{
                width: "100%", height: 58, borderRadius: 18, border: "none",
                background: `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
                color: "#fff", fontSize: 17, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
                boxShadow: DS.shadowPrimary,
              }}
            >
              Fazer login
            </button>
          </motion.div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen bg={DS.surface}>
      {/* Header */}
      <div style={{ padding: "52px 24px 16px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0, borderBottom: `1px solid ${DS.border}` }}>
        <button
          onClick={handleBack}
          style={{ width: 40, height: 40, borderRadius: 12, border: `1.5px solid ${DS.borderMd}`, background: DS.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke={DS.text1} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <LogoMark size={32} />
        <div>
          <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>PASSO {step} DE 2</p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: DS.text1, letterSpacing: "-0.3px" }}>
            {step === 1 ? "Seus dados" : "Acesso à conta"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: DS.border, flexShrink: 0 }}>
        <motion.div
          animate={{ width: step === 1 ? "50%" : "100%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{ height: "100%", background: `linear-gradient(to right, ${DS.primaryDark}, ${DS.primary})`, borderRadius: 2 }}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 0" }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.div key="step1"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <Field label="Nome completo" placeholder="Guilherme Santos" value={nome} onChange={setNome} error={errors.nome} />
              <Field label="CPF" placeholder="000.000.000-00" value={cpf}
                onChange={v => setCpf(formatCPF(v))} error={errors.cpf} />
              <Field label="Data de nascimento" type="date" placeholder="" value={nasc} onChange={setNasc} error={errors.nasc} />
              <Field label="Celular" placeholder="(11) 99999-0000" value={cel}
                onChange={v => setCel(formatPhone(v))} error={errors.cel} />
            </motion.div>
          ) : (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <Field label="E-mail" type="email" placeholder="guilherme@email.com" value={email} onChange={setEmail} error={errors.email} />
              <Field label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={senha} onChange={setSenha} error={errors.senha} />
              <Field label="Confirmar senha" type="password" placeholder="Repita sua senha" value={confirma} onChange={setConfirma} error={errors.confirma} />
              <div style={{ background: DS.primaryLight, border: `1.5px solid ${DS.primaryMid}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: DS.primary, fontWeight: 600, lineHeight: 1.5 }}>
                  Sua senha deve ter pelo menos 8 caracteres.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: "16px 24px 44px", flexShrink: 0 }}>
        <button
          onClick={handleNext}
          style={{
            width: "100%", height: 58, borderRadius: 18, border: "none",
            background: `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
            color: "#fff", fontSize: 17, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Inter', sans-serif",
            boxShadow: DS.shadowPrimary,
            transition: "transform 0.1s",
          }}
          onPointerDown={e => { e.currentTarget.style.transform = "scale(0.975)"; }}
          onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {step === 1 ? "Continuar" : "Criar conta"}
        </button>
        {step === 1 && (
          <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 12, color: DS.text3 }}>
            Já tem conta?{" "}
            <span onClick={() => nav("/login")} style={{ color: DS.primary, fontWeight: 700, cursor: "pointer" }}>
              Entrar
            </span>
          </p>
        )}
      </div>
    </Screen>
  );
}
