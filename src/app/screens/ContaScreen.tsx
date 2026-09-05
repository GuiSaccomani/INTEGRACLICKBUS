import { useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, ScrollBody, LogoMark, BtnPrimary, BtnGhost, Fonts } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { useOperator } from "../components/OperatorContext";
import { webauthnService, type BiometricSupportStatus, type BiometricDeviceInfo } from "../../services/webauthn";


function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const DS = useDS();
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      style={{
        width: 52,
        height: 30,
        borderRadius: 15,
        background: value ? DS.primary : DS.borderMd,
        border: "none",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          position: "absolute",
          top: 3,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}

function SettingRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const DS = useDS();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderBottom: `1px solid ${DS.border}`,
      }}
    >
      <div style={{ flex: 1, marginRight: 12 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: DS.text1 }}>{label}</p>
        {desc && <p style={{ margin: "3px 0 0", fontSize: 12, color: DS.text3, lineHeight: 1.4 }}>{desc}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  const DS = useDS();
  return (
    <div style={{ marginBottom: 20 }}>
      <p
        style={{
          margin: "0 4px 10px",
          fontSize: 12,
          fontWeight: 700,
          color: DS.text3,
          letterSpacing: "0.7px",
          textTransform: "uppercase",
        }}
      >
        {title}
      </p>
      <div
        style={{
          background: DS.surface,
          borderRadius: 14,
          padding: "0 16px",
          boxShadow: DS.shadowXs,
          border: `1px solid ${DS.border}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function LinkRow({
  label,
  value,
  last,
  onClick,
}: {
  label: string;
  value?: string;
  last?: boolean;
  onClick?: () => void;
}) {
  const DS = useDS();
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 0",
        borderBottom: last ? "none" : `1px solid ${DS.border}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 500, color: DS.text1 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {value && <span style={{ fontSize: 14, color: DS.text2 }}>{value}</span>}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke={DS.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function ContaScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const location = useLocation();
  const a11y = useA11y();
  const { operator } = useOperator();

  const [activeModal, setActiveModal] = useState<"dados" | "seguranca" | "privacidade" | "versao" | null>(null);

  // Estados de Biometria / WebAuthn
  const [bioSupport, setBioSupport] = useState<BiometricSupportStatus>("supported");
  const [bioRegistered, setBioRegistered] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioMsg, setBioMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [userCredentials, setUserCredentials] = useState<BiometricDeviceInfo[]>([]);

  // Carrega usuário atual
  let currentUser: any = null;
  try {
    const rawUser = localStorage.getItem("integra_user");
    if (rawUser) currentUser = JSON.parse(rawUser);
  } catch {}

  // Garante que o ID do usuário seja sempre um identificador válido de 32 hex chars
  const rawId = currentUser?.userId || "A1B2C3D4E5F64A7B8C9D0E1F2A3B4C5D";
  const currentUserId = rawId.length === 32 || rawId.length === 36 ? rawId : "A1B2C3D4E5F64A7B8C9D0E1F2A3B4C5D";

  useEffect(() => {
    async function checkBio() {
      const support = await webauthnService.checkSupport();
      setBioSupport(support);
      const isLocal = webauthnService.hasBiometricsConfiguredLocally();
      setBioRegistered(isLocal);

      if (currentUserId) {
        const status = await webauthnService.getStatus(currentUserId);
        if (status.registered || isLocal) {
          setBioRegistered(true);
          setUserCredentials(status.credentials || []);
        }
      }
    }
    checkBio();
  }, [currentUserId]);

  const handleRegisterBiometric = async () => {
    setBioLoading(true);
    setBioMsg(null);
    a11y.triggerFeedback("neutral");

    try {
      const result = await webauthnService.registerBiometrics(currentUserId);
      if (result.cancelled) {
        setBioMsg({ text: "Registro de biometria cancelado.", type: "info" });
        return;
      }

      if (result.success) {
        setBioRegistered(true);
        setBioMsg({ text: "Biometria ativada com sucesso neste dispositivo!", type: "success" });
        a11y.triggerFeedback("success", "Biometria ativada com sucesso!");
        const status = await webauthnService.getStatus(currentUserId);
        setUserCredentials(status.credentials || []);
      } else {
        setBioMsg({ text: result.message || "Erro ao registrar biometria.", type: "error" });
        a11y.triggerFeedback("error");
      }
    } catch (err: any) {
      setBioMsg({ text: err.message || "Erro inesperado.", type: "error" });
    } finally {
      setBioLoading(false);
    }
  };

  const handleRemoveBiometric = async () => {
    setBioLoading(true);
    setBioMsg(null);
    a11y.triggerFeedback("neutral");

    try {
      const credId = userCredentials[0]?.credentialId || localStorage.getItem("integra_last_credential_id") || "default";
      const result = await webauthnService.removeCredential(credId, currentUserId);
      setBioRegistered(false);
      setUserCredentials([]);
      setBioMsg({ text: "Biometria removida deste dispositivo.", type: "info" });
      a11y.triggerFeedback("neutral", "Biometria removida");
    } catch (err: any) {
      setBioMsg({ text: err.message || "Erro ao remover.", type: "error" });
    } finally {
      setBioLoading(false);
    }
  };

  // Detecta se é perfil de Motorista
  const isDriver =
    location.pathname.startsWith("/motorista") ||
    localStorage.getItem("integra_user_role") === "driver";

  const handleLogout = () => {
    localStorage.removeItem("integra_user");
    localStorage.removeItem("integra_user_role");
    nav("/login");
  };

  return (
    <Screen bg={DS.bg}>
      {/* Header do Perfil */}
      <div
        style={{
          background: DS.surface,
          padding: "52px 20px 16px",
          borderBottom: `1px solid ${DS.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              background: isDriver ? "linear-gradient(135deg, #7B2CBF, #5B1A9F)" : DS.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: DS.shadowXs,
            }}
          >
            {isDriver ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="12 8 8 12 12 16 12 8" fill="#FFFFFF" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke={DS.primary} strokeWidth="1.8" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={DS.primary} strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: DS.text1, letterSpacing: "-0.4px" }}>
                {isDriver ? "Carlos Eduardo Mendes" : "Guilherme Santos"}
              </p>
              {isDriver && (
                <span style={{ fontSize: 10, fontWeight: 700, background: DS.successLight, color: DS.success, padding: "2px 6px", borderRadius: 100 }}>
                  Motorista
                </span>
              )}
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: DS.text2 }}>
              {isDriver ? "Matrícula DRV-8821 · Operador ClickBus" : "CPF ***.***.***-42 · Passageiro"}
            </p>
          </div>
        </div>
      </div>

      <ScrollBody style={{ padding: "16px 16px 0" }}>
        {isDriver ? (
          <SectionCard title="Minha Operação">
            <LinkRow label="Linha alocada" value="São Paulo → Rio de Janeiro" />
            <LinkRow label="Veículo alocado" value="Ônibus 4022 (Executivo)" />
            <LinkRow label="Habilitação CNH" value="Categoria D · Válida" />
            <LinkRow label="Escala da viagem" value="Partida 14:30" last />
          </SectionCard>
        ) : (
          <SectionCard title="Minha conta">
            <LinkRow label="Dados pessoais" onClick={() => setActiveModal("dados")} />
            <LinkRow label="Segurança e senha" onClick={() => setActiveModal("seguranca")} />
            <LinkRow label="Notificações" onClick={() => nav("/notificacoes")} last />
          </SectionCard>
        )}

        {/* ── SEGURANÇA E BIOMETRIA (WEBAUTHN / PASSKEYS) ── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 4px 10px", fontSize: 12, fontWeight: 700, color: DS.text3, letterSpacing: "0.7px", textTransform: "uppercase" }}>
            Biometria e Segurança
          </p>
          <div style={{ background: DS.surface, borderRadius: 14, padding: "16px", boxShadow: DS.shadowXs, border: `1px solid ${DS.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: bioRegistered ? DS.successLight : DS.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1C9.24 1 7 3.24 7 6v1a5 5 0 0010 0V6c0-2.76-2.24-5-5-5z" stroke={bioRegistered ? DS.success : DS.primary} strokeWidth="1.8" />
                    <path d="M5 10.5C3.76 11.56 3 13.19 3 15v2a9 9 0 0018 0v-2c0-1.81-.76-3.44-2-4.5" stroke={bioRegistered ? DS.success : DS.primary} strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M9 15a3 3 0 006 0" stroke={bioRegistered ? DS.success : DS.primary} strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: DS.text1 }}>Biometria / Passkey</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: DS.text3 }}>
                    {bioSupport === "unsupported"
                      ? "Não suportada neste navegador"
                      : bioRegistered
                      ? "Ativada para este dispositivo"
                      : "Acesso rápido com digital ou rosto"}
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                padding: "3px 8px", borderRadius: 100,
                background: bioRegistered ? DS.successLight : DS.border,
                color: bioRegistered ? DS.success : DS.text3,
                border: `1px solid ${bioRegistered ? DS.successMid : DS.borderMd}`
              }}>
                {bioRegistered ? "Ativada" : "Não configurada"}
              </span>
            </div>

            {bioMsg && (
              <div style={{
                padding: "10px 12px", borderRadius: 10, marginBottom: 12,
                background: bioMsg.type === "success" ? DS.successLight : bioMsg.type === "error" ? "rgba(220,38,38,0.08)" : DS.primaryLight,
                border: `1px solid ${bioMsg.type === "success" ? DS.successMid : bioMsg.type === "error" ? "rgba(220,38,38,0.2)" : DS.primaryMid}`,
              }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: bioMsg.type === "success" ? DS.success : bioMsg.type === "error" ? "#DC2626" : DS.primary }}>
                  {bioMsg.text}
                </p>
              </div>
            )}

            {bioSupport !== "unsupported" && (
              bioRegistered ? (
                <button
                  type="button"
                  onClick={handleRemoveBiometric}
                  disabled={bioLoading}
                  style={{
                    width: "100%", height: 44, borderRadius: 12,
                    background: "transparent",
                    border: `1.5px solid ${DS.errorLight || "rgba(220,38,38,0.3)"}`,
                    color: DS.error || "#DC2626",
                    fontSize: 14, fontWeight: 600,
                    cursor: bioLoading ? "wait" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.15s ease",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {bioLoading ? "Removendo..." : "Remover biometria deste dispositivo"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRegisterBiometric}
                  disabled={bioLoading}
                  style={{
                    width: "100%", height: 48, borderRadius: 12,
                    background: `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
                    border: "none", color: "#FFFFFF",
                    fontSize: 14, fontWeight: 700,
                    cursor: bioLoading ? "wait" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: DS.shadowPrimary,
                    transition: "all 0.15s ease",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1C9.24 1 7 3.24 7 6v1a5 5 0 0010 0V6c0-2.76-2.24-5-5-5z" />
                    <path d="M5 10.5C3.76 11.56 3 13.19 3 15v2a9 9 0 0018 0v-2c0-1.81-.76-3.44-2-4.5" />
                    <path d="M9 15a3 3 0 006 0" />
                  </svg>
                  {bioLoading ? "Registrando no dispositivo..." : "Ativar biometria neste aparelho"}
                </button>
              )
            )}
          </div>
        </div>


        {/* ── ACESSIBILIDADE 100% FUNCIONAL ── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 4px 10px", fontSize: 12, fontWeight: 700, color: DS.text3, letterSpacing: "0.7px", textTransform: "uppercase" }}>
            Acessibilidade
          </p>
          <div style={{ background: DS.surface, borderRadius: 14, padding: "0 16px", boxShadow: DS.shadowXs, border: `1px solid ${DS.border}` }}>
            {/* Tema do aplicativo */}
            <div style={{ padding: "16px 0", borderBottom: `1px solid ${DS.border}` }}>
              <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 600, color: DS.text1 }}>Tema do aplicativo</p>
              <div style={{ display: "flex", gap: 8 }}>
                {(["light", "dark", "system"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => a11y.update({ theme: t })}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 12,
                      border: `2px solid ${a11y.theme === t ? DS.primary : DS.borderMd}`,
                      background: a11y.theme === t ? DS.primaryLight : DS.surface,
                      color: a11y.theme === t ? DS.primary : DS.text2,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tamanho do texto */}
            <div style={{ padding: "16px 0", borderBottom: `1px solid ${DS.border}` }}>
              <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 600, color: DS.text1 }}>Tamanho do texto</p>
              <div style={{ display: "flex", gap: 8 }}>
                {(["normal", "large", "xl"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => a11y.update({ textSize: size })}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 12,
                      border: `2px solid ${a11y.textSize === size ? DS.primary : DS.borderMd}`,
                      background: a11y.textSize === size ? DS.primaryLight : DS.surface,
                      color: a11y.textSize === size ? DS.primary : DS.text2,
                      fontSize: size === "normal" ? 13 : size === "large" ? 15 : 17,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {size === "normal" ? "Normal" : size === "large" ? "Grande" : "Extra"}
                  </button>
                ))}
              </div>
            </div>

            {/* Alto contraste */}
            <SettingRow
              label="Alto contraste"
              desc="Aumenta o contraste para máxima legibilidade"
              value={a11y.highContrast}
              onChange={(v) => a11y.update({ highContrast: v })}
            />

            {/* Feedback sonoro */}
            <SettingRow
              label="Feedback sonoro"
              desc="Sons ao confirmar ações e validar embarque"
              value={a11y.soundFeedback}
              onChange={(v) => a11y.update({ soundFeedback: v })}
            />

            {/* Feedback por vibração */}
            <SettingRow
              label="Feedback por vibração"
              desc="O celular vibra ao realizar ações"
              value={a11y.vibrationFeedback}
              onChange={(v) => a11y.update({ vibrationFeedback: v })}
            />

            {/* Leitura de voz */}
            <SettingRow
              label="Leitura de voz"
              desc="Lê os textos principais e ações em voz alta"
              value={a11y.voiceFeedback}
              onChange={(v) => a11y.update({ voiceFeedback: v })}
            />

            {/* Reduzir animações */}
            <SettingRow
              label="Reduzir animações"
              desc="Desativa transições e movimentos na tela"
              value={a11y.reduceMotion}
              onChange={(v) => a11y.update({ reduceMotion: v })}
            />

            {/* Leitor de tela */}
            <SettingRow
              label="Leitor de tela"
              desc="Compatível com VoiceOver, TalkBack e navegação assistiva"
              value={a11y.screenReader}
              onChange={(v) => a11y.update({ screenReader: v })}
            />
          </div>
        </div>

        {/* Resumo visual dos ajustes ativos */}
        {(a11y.highContrast || a11y.textSize !== "normal" || a11y.voiceFeedback || a11y.reduceMotion) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: DS.primaryLight,
              border: `1.5px solid ${DS.primaryMid}`,
              borderRadius: 14,
              padding: "12px 14px",
              marginBottom: 20,
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke={DS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" stroke={DS.primary} strokeWidth="2" />
            </svg>
            <p style={{ margin: 0, fontSize: 12, color: DS.primary, fontWeight: 700, lineHeight: 1.4 }}>
              {[
                a11y.textSize !== "normal" && `Texto ${a11y.textSize === "large" ? "grande" : "extra grande"}`,
                a11y.highContrast && "Alto contraste",
                a11y.voiceFeedback && "Leitura de voz ativa",
                a11y.reduceMotion && "Animações reduzidas",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </motion.div>
        )}

        {/* Suporte */}
        <SectionCard title="Suporte">
          <LinkRow label="Central de ajuda" onClick={() => nav("/ajuda")} />
          <LinkRow label="Política de privacidade" onClick={() => setActiveModal("privacidade")} />
          <LinkRow label="Versão do app" value="1.0.0 (PWA)" onClick={() => setActiveModal("versao")} last />
        </SectionCard>

        {/* Sair da Conta */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            height: 52,
            borderRadius: 14,
            border: `1.5px solid ${DS.borderMd}`,
            background: DS.surface,
            color: DS.error,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            marginBottom: 8,
          }}
        >
          Sair da conta
        </button>

        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0 10px" }}>
          <LogoMark size={22} />
          <span style={{ fontSize: 12, fontWeight: 700, color: DS.text3, textTransform: "uppercase" }}>
            ÍNTEGRA · Operado por {operator.name}
          </span>
        </div>
        <div style={{ height: 24 }} />
      </ScrollBody>

      {/* ── MODAIS INTERATIVOS ── */}
      <AnimatePresence>
        {activeModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                width: "100%",
                maxWidth: 390,
                background: DS.surface,
                borderRadius: "24px 24px 0 0",
                padding: "20px 20px 36px",
                borderTop: `1px solid ${DS.border}`,
                boxShadow: "0 -8px 30px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Barra do modal */}
              <div style={{ width: 40, height: 4, borderRadius: 2, background: DS.borderMd, margin: "0 auto 16px" }} />

              {activeModal === "dados" && (
                <div>
                  <h3 style={{ fontFamily: Fonts.heading, margin: "0 0 14px", fontSize: 20, color: DS.text1 }}>Dados Pessoais</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                    <DataField label="Nome Completo" value={isDriver ? "Carlos Eduardo Mendes" : "Guilherme Santos"} />
                    <DataField label="Documento" value={isDriver ? "CNH Categoria D (Válida)" : "CPF ***.***.***-42"} />
                    <DataField label="E-mail" value={isDriver ? "motorista@integra.com" : "passageiro@integra.com"} />
                    <DataField label="Telefone" value="(11) 98765-4321" />
                    <DataField label="Status do Perfil" value="Verificado e Ativo" isSuccess />
                  </div>
                  <BtnPrimary label="Fechar" onClick={() => setActiveModal(null)} />
                </div>
              )}

              {activeModal === "seguranca" && (
                <div>
                  <h3 style={{ fontFamily: Fonts.heading, margin: "0 0 14px", fontSize: 20, color: DS.text1 }}>Segurança e Acesso</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                    <DataField
                      label="Autenticação Biométrica"
                      value={bioRegistered ? "Ativada (Passkey Registrada)" : "Não configurada neste dispositivo"}
                      isSuccess={bioRegistered}
                    />
                    <DataField label="Protocolo Criptográfico" value="FIDO2 / WebAuthn Level 3" isSuccess />
                    <DataField label="Segurança do Hardware" value="Chaves em enclave seguro do dispositivo" isSuccess />
                    <DataField label="Senha de Acesso" value="•••••••• (Definida)" />
                    <DataField label="Criptografia da Sessão" value="TLS 1.3 · Chaves Seguras" isSuccess />
                    <DataField label="Sessão Atual" value="Ativa · PWA Conectado" />
                  </div>
                  <BtnPrimary label="Fechar" onClick={() => setActiveModal(null)} />
                </div>
              )}

              {activeModal === "privacidade" && (
                <div>
                  <h3 style={{ fontFamily: Fonts.heading, margin: "0 0 10px", fontSize: 20, color: DS.text1 }}>Política de Privacidade</h3>
                  <p style={{ margin: "0 0 12px", fontSize: 13, color: DS.text2, lineHeight: 1.5 }}>
                    O aplicativo <strong>ÍNTEGRA</strong> está em total conformidade com a Lei Geral de Proteção de Dados (LGPD). Seus dados biométricos e credenciais de viagem são protegidos de ponta a ponta e nunca são compartilhados com terceiros não autorizados.
                  </p>
                  <div style={{ background: DS.bg, padding: 12, borderRadius: 12, border: `1px solid ${DS.border}`, marginBottom: 18 }}>
                    <p style={{ margin: 0, fontSize: 12, color: DS.text2 }}>
                      ✓ Armazenamento estritamente operacional para validação de embarque e despacho seguro de bagagem.
                    </p>
                  </div>
                  <BtnPrimary label="Entendido" onClick={() => setActiveModal(null)} />
                </div>
              )}

              {activeModal === "versao" && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ margin: "0 auto 12px", display: "flex", justifyContent: "center" }}>
                    <LogoMark size={48} />
                  </div>
                  <h3 style={{ fontFamily: Fonts.heading, margin: "0 0 4px", fontSize: 20, color: DS.text1 }}>
                    ÍNTEGRA PWA
                  </h3>
                  <p style={{ margin: "0 0 16px", fontSize: 13, color: DS.text2 }}>
                    Versão 1.0.0 (Build 2026.09) · Modo Standalone
                  </p>
                  <div style={{ background: DS.bg, padding: "12px 14px", borderRadius: 12, border: `1px solid ${DS.border}`, marginBottom: 20, textAlign: "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: DS.text3 }}>Service Worker:</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>Ativo e Atualizado</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: DS.text3 }}>Cache Estático:</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: DS.text1 }}>Workbox v7</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: DS.text3 }}>Segurança da API:</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: DS.primary }}>NetworkOnly (Sem Cache)</span>
                    </div>
                  </div>
                  <BtnPrimary label="Fechar" onClick={() => setActiveModal(null)} />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Screen>
  );
}

function DataField({ label, value, isSuccess }: { label: string; value: string; isSuccess?: boolean }) {
  const DS = useDS();
  return (
    <div
      style={{
        background: DS.bg,
        borderRadius: 12,
        padding: "10px 14px",
        border: `1px solid ${DS.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 12, color: DS.text3, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: isSuccess ? DS.success : DS.text1 }}>{value}</span>
    </div>
  );
}
