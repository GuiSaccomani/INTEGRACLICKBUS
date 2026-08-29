import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, ScrollBody, LogoMark } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const DS = useDS();
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 52, height: 30, borderRadius: 15,
      background: value ? DS.primary : DS.borderMd,
      border: "none", cursor: "pointer",
      position: "relative", flexShrink: 0,
      transition: "background 0.2s",
    }}>
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          position: "absolute", top: 3,
          width: 24, height: 24, borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}

function SettingRow({ label, desc, value, onChange }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  const DS = useDS();
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 0",
      borderBottom: `1px solid ${DS.border}`,
    }}>
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
      <p style={{ margin: "0 4px 10px", fontSize: 12, fontWeight: 700, color: DS.text3, letterSpacing: "0.7px", textTransform: "uppercase" }}>{title}</p>
      <div style={{ background: DS.surface, borderRadius: 12, padding: "0 16px", boxShadow: DS.shadowXs, border: `1px solid ${DS.border}` }}>
        {children}
      </div>
    </div>
  );
}

function LinkRow({ label, value, last }: { label: string; value?: string; last?: boolean }) {
  const DS = useDS();
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "15px 0",
      borderBottom: last ? "none" : `1px solid ${DS.border}`,
    }}>
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

import { useOperator } from "../components/OperatorContext";

export function ContaScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const a11y = useA11y();
  const { operator } = useOperator();

  return (
    <Screen bg={DS.bg}>
      {/* Header */}
      <div style={{
        background: DS.surface, padding: "52px 20px 16px",
        borderBottom: `1px solid ${DS.border}`, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke={DS.primary} strokeWidth="1.5" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={DS.primary} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: DS.text1, letterSpacing: "-0.4px" }}>Guilherme Santos</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: DS.text2 }}>CPF ***.***.***-42</p>
          </div>
        </div>
      </div>

      <ScrollBody style={{ padding: "16px 16px 0" }}>
        <SectionCard title="Minha conta">
          <LinkRow label="Dados pessoais" />
          <LinkRow label="Segurança e senha" />
          <LinkRow label="Notificações" last />
        </SectionCard>

        {/* Accessibility — expanded with real controls */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 4px 10px", fontSize: 12, fontWeight: 700, color: DS.text3, letterSpacing: "0.7px", textTransform: "uppercase" }}>
            Acessibilidade
          </p>
          <div style={{ background: DS.surface, borderRadius: 12, padding: "0 16px", boxShadow: DS.shadowXs, border: `1px solid ${DS.border}` }}>
            {/* Temas */}
            <div style={{ padding: "16px 0", borderBottom: `1px solid ${DS.border}` }}>
              <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 600, color: DS.text1 }}>Tema do aplicativo</p>
              <div style={{ display: "flex", gap: 8 }}>
                {(["light", "dark", "system"] as const).map(t => (
                  <button key={t} onClick={() => a11y.update({ theme: t })} style={{
                    flex: 1, height: 44, borderRadius: 12,
                    border: `2px solid ${a11y.theme === t ? DS.primary : DS.borderMd}`,
                    background: a11y.theme === t ? DS.primaryLight : DS.surface,
                    color: a11y.theme === t ? DS.primary : DS.text2,
                    fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    transition: "all 0.15s",
                  }}>
                    {t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema"}
                  </button>
                ))}
              </div>
            </div>
            {/* Text size */}
            <div style={{ padding: "16px 0", borderBottom: `1px solid ${DS.border}` }}>
              <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 600, color: DS.text1 }}>Tamanho do texto</p>
              <div style={{ display: "flex", gap: 8 }}>
                {(["normal", "large", "xl"] as const).map(size => (
                  <button key={size} onClick={() => a11y.update({ textSize: size })} style={{
                    flex: 1, height: 44, borderRadius: 12,
                    border: `2px solid ${a11y.textSize === size ? DS.primary : DS.borderMd}`,
                    background: a11y.textSize === size ? DS.primaryLight : DS.surface,
                    color: a11y.textSize === size ? DS.primary : DS.text2,
                    fontSize: size === "normal" ? 13 : size === "large" ? 15 : 17,
                    fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    transition: "all 0.15s",
                  }}>
                    {size === "normal" ? "Normal" : size === "large" ? "Grande" : "Extra"}
                  </button>
                ))}
              </div>
            </div>

            <SettingRow
              label="Alto contraste"
              desc="Aumenta o contraste para maior legibilidade"
              value={a11y.highContrast}
              onChange={v => a11y.update({ highContrast: v })}
            />
            <SettingRow
              label="Feedback sonoro"
              desc="Sons ao confirmar ações"
              value={a11y.soundFeedback}
              onChange={v => a11y.update({ soundFeedback: v })}
            />
            <SettingRow
              label="Feedback por vibração"
              desc="O celular vibra ao realizar ações"
              value={a11y.vibrationFeedback}
              onChange={v => a11y.update({ vibrationFeedback: v })}
            />
            <SettingRow
              label="Leitura de voz"
              desc="Lê os textos principais em voz alta"
              value={a11y.voiceFeedback}
              onChange={v => a11y.update({ voiceFeedback: v })}
            />
            <SettingRow
              label="Reduzir animações"
              desc="Desativa transições e movimentos na tela"
              value={a11y.reduceMotion}
              onChange={v => a11y.update({ reduceMotion: v })}
            />
            <SettingRow
              label="Leitor de tela"
              desc="Compatível com VoiceOver e TalkBack"
              value={a11y.screenReader}
              onChange={v => a11y.update({ screenReader: v })}
            />
          </div>
        </div>

        {/* Preview of current settings */}
        {(a11y.highContrast || a11y.textSize !== "normal") && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: DS.primaryLight, border: `1.5px solid ${DS.primaryMid}`,
              borderRadius: 14, padding: "12px 14px", marginBottom: 20,
              display: "flex", gap: 10, alignItems: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" stroke={DS.primary} strokeWidth="1.8" />
            </svg>
            <p style={{ margin: 0, fontSize: 12, color: DS.primary, fontWeight: 600, lineHeight: 1.4 }}>
              {[
                a11y.textSize !== "normal" && `Texto ${a11y.textSize === "large" ? "grande" : "extra grande"} ativado`,
                a11y.highContrast && "Alto contraste ativado",
              ].filter(Boolean).join(" · ")}
            </p>
          </motion.div>
        )}

        <SectionCard title="Suporte">
          <div onClick={() => nav("/ajuda")} style={{ cursor: "pointer" }}>
            <LinkRow label="Central de ajuda" />
          </div>
          <LinkRow label="Política de privacidade" />
          <LinkRow label="Versão do app" value="1.0.0" last />
        </SectionCard>

        {/* Logout */}
        <button onClick={() => nav("/")} style={{
          width: "100%", height: 52, borderRadius: 14,
          border: `1.5px solid ${DS.borderMd}`, background: DS.surface,
          color: DS.error, fontSize: 15, fontWeight: 600,
          cursor: "pointer", fontFamily: "'Inter', sans-serif", marginBottom: 8,
        }}>
          Sair da conta
        </button>

        {/* Íntegra branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0 8px" }}>
          <LogoMark size={22} />
          <span style={{ fontSize: 12, fontWeight: 700, color: DS.text3, textTransform: "uppercase" }}>ÍNTEGRA · Operado por {operator.name}</span>
        </div>
        <div style={{ height: 16 }} />
      </ScrollBody>

    </Screen>
  );
}
