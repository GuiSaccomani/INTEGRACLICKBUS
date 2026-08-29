import { useNavigate, useLocation } from "react-router";
import { useDS, Screen, StatusBadge } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";

function BottomNavDriver() {
  const DS = useDS();
  const nav = useNavigate();
  const loc = useLocation();

  const TABS = [
    { id: "home", label: "Início", path: "/motorista/home", icon: (w: string) => (
      <>
        <path d="M3 12L12 3l9 9v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9z" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      </>
    )},
    { id: "viagens", label: "Viagens", path: "/motorista/historico", icon: (w: string) => (
      <>
        <rect x="2" y="6" width="20" height="14" rx="3" strokeWidth={w} />
        <path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1" strokeWidth={w} strokeLinecap="round" />
        <line x1="12" y1="11" x2="12" y2="17" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="9" y1="14" x2="15" y2="14" strokeWidth="1.8" strokeLinecap="round" />
      </>
    )},
    { id: "bagagens", label: "Bagagens", path: "/motorista/lista-bagagens", icon: (w: string) => (
      <>
        <rect x="5" y="8" width="14" height="11" rx="2" strokeWidth={w} />
        <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth={w} strokeLinecap="round" />
        <line x1="5" y1="13" x2="19" y2="13" strokeWidth="1.8" strokeLinecap="round" />
      </>
    )},
    { id: "conta", label: "Conta", path: "/conta", icon: (w: string) => (
      <>
        <circle cx="12" cy="8" r="4" strokeWidth={w} />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth={w} strokeLinecap="round" />
      </>
    )},
  ];

  return (
    <div style={{
      display: "flex",
      background: DS.surface,
      borderTop: `1px solid ${DS.border}`,
      paddingBottom: 18,
      flexShrink: 0,
      zIndex: 10,
    }}>
      {TABS.map(t => {
        const active = loc.pathname.startsWith(t.path) || (t.path === "/motorista/home" && loc.pathname === "/motorista/home");
        const c = active ? DS.primary : DS.text3;
        const w = active ? "2.2" : "1.8";
        return (
          <button
            key={t.id}
            onClick={() => nav(t.path)}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              padding: "11px 0 0", fontFamily: "'Inter', sans-serif",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c}>
              {t.icon(w)}
            </svg>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: c }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function MotoristaHomeScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { textSize } = useA11y();

  const titleSize = textSize === "xl" ? 22 : textSize === "large" ? 20 : 18;
  const descSize = textSize === "xl" ? 16 : textSize === "large" ? 14 : 13;

  return (
    <Screen bg={DS.bg}>
      {/* ── CABEÇALHO ── */}
      <div style={{
        background: DS.surface, padding: "52px 20px 20px",
        borderBottom: `1px solid ${DS.border}`, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: DS.text3, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              MODO MOTORISTA
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 900, color: DS.text1, letterSpacing: "-0.5px" }}>
              Operação de Embarque
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ width: 40, height: 40, borderRadius: 12, border: `1.5px solid ${DS.borderMd}`, background: DS.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={DS.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 01-3.46 0" stroke={DS.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={() => nav("/conta")} style={{ width: 40, height: 40, borderRadius: 12, border: `1.5px solid ${DS.borderMd}`, background: DS.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke={DS.text2} strokeWidth="2" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.6.8 1 1.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={DS.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: descSize + 1, color: DS.text2, lineHeight: 1.4, fontWeight: 500 }}>
          Gerencie o embarque e as bagagens da viagem.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 30px", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* ── AÇÕES PRINCIPAIS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Card 1 — Validar Passageiro (Destaque Principal) */}
          <button
            onClick={() => nav("/motorista/validacao")}
            style={{
              width: "100%", textAlign: "left", padding: "22px 20px",
              background: `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
              borderRadius: 12, border: "none", cursor: "pointer",
              boxShadow: DS.shadowPrimary, display: "flex", alignItems: "center", gap: 16,
              transition: "transform 0.15s",
            }}
            onPointerDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: titleSize + 1, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
                Validar passageiro
              </p>
              <p style={{ margin: "4px 0 0", fontSize: descSize, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, fontWeight: 500 }}>
                Leia NFC ou QR Code para confirmar o embarque.
              </p>
            </div>
            <div style={{ paddingLeft: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {/* Card 2 — Adicionar bagagem */}
          <button
            onClick={() => nav("/motorista/bagagem")}
            style={{
              width: "100%", textAlign: "left", padding: "20px 20px",
              background: DS.surface, borderRadius: 12,
              border: `1px solid ${DS.border}`, cursor: "pointer",
              boxShadow: DS.shadowXs, display: "flex", alignItems: "center", gap: 16,
              transition: "transform 0.15s",
            }}
            onPointerDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.primary} strokeWidth="2.2" />
                <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.primary} strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: titleSize, fontWeight: 800, color: DS.text1, letterSpacing: "-0.2px" }}>
                Adicionar bagagem
              </p>
              <p style={{ margin: "4px 0 0", fontSize: descSize, color: DS.text2, lineHeight: 1.35 }}>
                Associe uma tag NFC à bagagem do passageiro.
              </p>
            </div>
            <div style={{ paddingLeft: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke={DS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {/* Card 3 — Limpar tag */}
          <button
            onClick={() => nav("/motorista/desembarque")}
            style={{
              width: "100%", textAlign: "left", padding: "20px 20px",
              background: DS.surface, borderRadius: 12,
              border: `1px solid ${DS.border}`, cursor: "pointer",
              boxShadow: DS.shadowXs, display: "flex", alignItems: "center", gap: 16,
              transition: "transform 0.15s",
            }}
            onPointerDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke={DS.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: titleSize, fontWeight: 700, color: DS.text1, letterSpacing: "-0.2px" }}>
                Limpar tag de bagagem
              </p>
              <p style={{ margin: "4px 0 0", fontSize: descSize, color: DS.text3, lineHeight: 1.35 }}>
                Remova os dados da tag para reutilização.
              </p>
            </div>
            <div style={{ paddingLeft: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke={DS.text3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </div>

        {/* ── RESUMO DA VIAGEM ── */}
        <div>
          <p style={{ margin: "0 4px 12px", fontSize: 13, fontWeight: 800, color: DS.text3, textTransform: "uppercase", letterSpacing: "0.8px" }}>
            Resumo da Viagem
          </p>
          <div style={{ background: DS.surface, borderRadius: 12, padding: "18px 20px", border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${DS.border}` }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: DS.text3, fontWeight: 600, letterSpacing: "0.5px" }}>PRÓXIMO DESTINO</p>
                <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: DS.text1, letterSpacing: "-0.3px" }}>Belo Horizonte</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <StatusBadge label="Em rota" kind="primary" />
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: DS.text1 }}>38</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: DS.text3, fontWeight: 600, lineHeight: 1.3 }}>Passageiros<br/>na viagem</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: DS.success }}>26</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: DS.text3, fontWeight: 600, lineHeight: 1.3 }}>Embarcados<br/>com sucesso</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: DS.primary }}>19</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: DS.text3, fontWeight: 600, lineHeight: 1.3 }}>Bagagens<br/>identificadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACESSO RÁPIDO ── */}
        <div>
          <p style={{ margin: "0 4px 12px", fontSize: 13, fontWeight: 800, color: DS.text3, textTransform: "uppercase", letterSpacing: "0.8px" }}>
            Acesso Rápido
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => nav("/motorista/passageiros")}
              style={{
                flex: 1, padding: "14px 4px", borderRadius: 12, background: `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
                border: "none", cursor: "pointer", color: "#fff",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                boxShadow: DS.shadowPrimary,
              }}
              onPointerDown={e => { e.currentTarget.style.transform = "scale(0.975)"; }}
              onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>Lista de<br/>passageiros</span>
            </button>

            <button
              onClick={() => nav("/motorista/lista-bagagens")}
              style={{
                flex: 1, padding: "14px 4px", borderRadius: 12, background: DS.surface,
                border: `1px solid ${DS.border}`, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                boxShadow: DS.shadowXs,
              }}
              onPointerDown={e => { e.currentTarget.style.transform = "scale(0.975)"; }}
              onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.text1} strokeWidth="2" />
                  <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.text1} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: DS.text1, textAlign: "center", lineHeight: 1.2 }}>Lista de<br/>bagagens</span>
            </button>

            <button
              onClick={() => nav("/motorista/historico")}
              style={{
                flex: 1, padding: "14px 4px", borderRadius: 12, background: DS.surface,
                border: `1px solid ${DS.border}`, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                boxShadow: DS.shadowXs,
              }}
              onPointerDown={e => { e.currentTarget.style.transform = "scale(0.975)"; }}
              onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={DS.text1} strokeWidth="2" />
                  <path d="M12 6v6l4 2" stroke={DS.text1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: DS.text1, textAlign: "center", lineHeight: 1.2 }}>Histórico<br/>da viagem</span>
            </button>
          </div>
        </div>

      </div>
      <BottomNavDriver />
    </Screen>
  );
}
