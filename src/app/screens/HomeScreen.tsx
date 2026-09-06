import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, StatusBadge, LogoMark, OperatorHeader, Fonts } from "../components/MobileLayout";
import { passengerApi, type TicketDetails } from "../../services/api";
import { getStoredFirstName, getStoredUserId } from "../../services/session";
import { cityOf, formatTripDateShort, formatTripTime, shortId, ticketStatus } from "../../services/format";

export function HomeScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showSeatMap, setShowSeatMap] = useState(false);

  const [tickets, setTickets] = useState<TicketDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const firstName = getStoredFirstName();

  useEffect(() => {
    let active = true;

    async function loadTickets() {
      const userId = getStoredUserId();
      if (!userId) {
        if (active) {
          setLoading(false);
          setLoadError("Sessão não encontrada. Entre novamente para ver suas viagens.");
        }
        return;
      }

      try {
        const result = await passengerApi.getUserTickets(userId);
        if (active) setTickets(Array.isArray(result) ? result : []);
      } catch (err: any) {
        if (active) setLoadError(err?.message || "Não foi possível carregar suas viagens.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTickets();
    return () => { active = false; };
  }, []);

  // Próxima viagem: primeira passagem ainda não utilizada; histórico: as já embarcadas
  const nextTrip = tickets.find(t => t.used !== 1) || null;
  const pastTrips = tickets.filter(t => t.used === 1);
  const HAS_TRIPS = Boolean(nextTrip);

  const status = nextTrip ? ticketStatus(nextTrip.sold, nextTrip.used) : null;

  const STEPS = [
    {
      num: "1",
      label: "Validar passagem",
      desc: "Apresente o QR Code ao motorista para autorizar o embarque.",
      action: "/qrcode",
      actionLabel: "Apresentar QR Code",
      done: nextTrip?.used === 1,
    },
    {
      num: "2",
      label: "Bagagem registrada automaticamente",
      desc: "Não é necessário fazer nada.",
      done: false,
      auto: true,
    },
    {
      num: "3",
      label: "Embarcar",
      desc: "Apresente sua credencial caso solicitado.",
      done: nextTrip?.used === 1,
    },
  ];

  return (
    <Screen bg={DS.bg}>
      {/* Header */}
      <div style={{
        background: DS.surface, padding: "52px 20px 16px",
        borderBottom: `1px solid ${DS.border}`, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke={DS.primary} strokeWidth="1.5" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={DS.primary} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: DS.text3, fontWeight: 500 }}>BOM DIA</p>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: DS.text1, letterSpacing: "-0.3px" }}>
              {firstName ? `Olá, ${firstName}` : "Olá"}
            </p>
          </div>
        </div>
        <button onClick={() => nav("/notificacoes")} style={{
          background: "none", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 8, marginRight: -8
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={DS.text2} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={DS.text2} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
        
        {loading ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`,
            padding: "40px 20px", marginBottom: 20, gap: 12,
          }}>
            <div style={{
              width: 28, height: 28,
              border: `3px solid ${DS.primaryMid}`, borderTopColor: DS.primary,
              borderRadius: "50%", animation: "spin 1s linear infinite",
            }} />
            <p style={{ margin: 0, fontSize: 13, color: DS.text2 }}>Carregando suas viagens...</p>
          </div>
        ) : HAS_TRIPS && nextTrip ? (
          <>
            {/* Label + badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: DS.text3, letterSpacing: "0.6px", textTransform: "uppercase" }}>
            Próxima viagem
          </p>
          {status && <StatusBadge label={status.label} kind={status.kind} />}
        </div>

        {/* Cartão expandível */}
        <div
          onClick={() => setExpanded(e => !e)}
          style={{
            background: `linear-gradient(135deg, #1A0533 0%, ${DS.primary} 100%)`, 
            borderRadius: 20,
            boxShadow: DS.shadowMd, border: `1px solid ${DS.border}`,
            overflow: "hidden", cursor: "pointer", marginBottom: 16,
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          
          <div style={{ padding: "18px 20px 16px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.5px" }}>ORIGEM</p>
                <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>
                  {cityOf(nextTrip.departure).toUpperCase()}
                </p>
              </div>
              <div style={{ padding: "0 12px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.5px" }}>DESTINO</p>
                <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>
                  {cityOf(nextTrip.arrival).toUpperCase()}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>DATA</p>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                  {formatTripDateShort(nextTrip.tripDate)}
                </p>
              </div>
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)" }} />
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>HORÁRIO</p>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                  {formatTripTime(nextTrip.tripDate)}
                </p>
              </div>
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)" }} />
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)" }} />
              <div 
                onClick={(e) => { e.stopPropagation(); setShowSeatMap(true); }}
                style={{ cursor: "pointer", background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: 8 }}
              >
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>ASSENTO</p>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: Fonts.heading }}>
                  {nextTrip.seat ?? "--"}
                </p>
              </div>
              <div style={{ flex: 1 }} />
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.22 }} style={{ opacity: 0.5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ padding: "0 20px 12px", position: "relative" }}>
                  {[
                    { label: "Passageiro", value: nextTrip.passengerName || "--" },
                    { label: "E-mail",     value: nextTrip.passengerEmail || "--" },
                    { label: "Bilhete",    value: shortId(nextTrip.ticketId, 12) },
                    { label: "Situação",   value: status?.label || "--" },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "9px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                    }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{row.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ padding: "0 14px 14px", position: "relative", display: "flex", gap: 8 }}>
            <button
              onClick={e => { e.stopPropagation(); nav("/qrcode"); }}
              style={{
                flex: 1.2, height: 48, borderRadius: 13, border: "none",
                background: "#fff",
                color: DS.primaryDark, fontSize: 13, fontWeight: 800,
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                transition: "transform 0.1s, background 0.2s",
              }}
              onPointerDown={e => { e.currentTarget.style.transform = "scale(0.975)"; }}
              onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="6" height="6" rx="1" stroke={DS.primaryDark} strokeWidth="2" />
                <rect x="14" y="4" width="6" height="6" rx="1" stroke={DS.primaryDark} strokeWidth="2" />
                <rect x="4" y="14" width="6" height="6" rx="1" stroke={DS.primaryDark} strokeWidth="2" />
                <path d="M14 14h6v6h-6v-6z" fill={DS.primaryDark} />
              </svg>
              QR Code
            </button>

            <button
              onClick={e => { e.stopPropagation(); nav("/passagem"); }}
              style={{
                flex: 1, height: 48, borderRadius: 13, border: "none",
                background: "rgba(255, 255, 255, 0.18)",
                backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
                borderTop: "1px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "transform 0.1s, background 0.2s",
              }}
              onPointerDown={e => { e.currentTarget.style.transform = "scale(0.975)"; }}
              onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="white" strokeWidth="2" />
                <path d="M8 12h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Passagem
            </button>
          </div>
        </div>

        {/* ── O QUE VOCÊ PRECISA FAZER ── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 4px 12px", fontSize: 14, fontWeight: 800, color: DS.text1 }}>
            O que você precisa fazer
          </p>
          <div style={{ background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs, overflow: "hidden" }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{
                display: "flex", gap: 14, padding: "14px 16px",
                borderBottom: i < STEPS.length - 1 ? `1px solid ${DS.border}` : "none",
                alignItems: "flex-start",
              }}>
                {/* Número */}
                <div style={{
                  width: 24, height: 24, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 2,
                }}>
                  {step.done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l4 4 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 15, fontWeight: 800, color: DS.primary }}>{step.num}.</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.text1 }}>{step.label}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: DS.text2, lineHeight: 1.4 }}>{step.desc}</p>
                  {step.auto && (
                    <span style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 700, color: DS.success, background: DS.successLight, borderRadius: 100, padding: "2px 10px" }}>
                      Automático
                    </span>
                  )}
                  {step.action && (
                    <button
                      onClick={() => nav(step.action!)}
                      style={{
                        display: "block", marginTop: 8,
                        height: 36, borderRadius: 10, border: "none",
                        background: `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
                        color: "#fff", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", fontFamily: "'Inter', sans-serif",
                        padding: "0 16px",
                      }}
                    >
                      {step.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </>) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`, padding: "40px 20px",
            marginBottom: 20, textAlign: "center"
          }}>
            <div style={{ marginBottom: 16 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M4 19V5a2 2 0 0 1 2-2h13.4a.6.6 0 0 1 .6.6v13.114M6 17h14M6 21h14" stroke={DS.text3} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: DS.text1, fontFamily: Fonts.heading }}>
              {loadError ? "Não foi possível carregar" : "Nenhuma viagem futura"}
            </p>
            <p style={{ margin: "8px 0 20px", fontSize: 13, color: DS.text2, lineHeight: 1.4 }}>
              {loadError || "Você ainda não tem nenhuma passagem agendada com esta operadora."}
            </p>
            <button style={{
              height: 44, padding: "0 20px", borderRadius: 100, border: "none",
              background: `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              Comprar Passagem
            </button>
          </div>
        )}

        {/* Viagens recentes */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1 }}>Viagens recentes</p>
          <button onClick={() => nav("/historico-completo")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600, color: DS.primary, fontFamily: Fonts.body,
          }}>Ver tudo</button>
        </div>
        <div style={{ background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs, overflow: "hidden" }}>
          {pastTrips.length === 0 ? (
            <p style={{ margin: 0, padding: "18px 16px", fontSize: 12, color: DS.text3, textAlign: "center" }}>
              {loading ? "Carregando..." : "Nenhuma viagem concluída ainda."}
            </p>
          ) : (
            pastTrips.map((item, i) => (
              <div key={item.ticketId} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                borderBottom: i < pastTrips.length - 1 ? `1px solid ${DS.border}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.text1 }}>
                    {cityOf(item.departure)} → {cityOf(item.arrival)}
                  </p>
                  <p style={{ margin: "1px 0 0", fontSize: 11, color: DS.text2 }}>{formatTripDateShort(item.tripDate)}</p>
                </div>
                <StatusBadge label="Concluída" kind="success" />
              </div>
            ))
          )}
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* Mapa de Assento Modal */}
      <AnimatePresence>
        {showSeatMap && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
            onClick={() => setShowSeatMap(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                width: "100%", background: DS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
                padding: "24px 20px 40px", boxShadow: DS.shadowMd
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: DS.text1, fontFamily: Fonts.heading }}>Mapa do Ônibus</p>
                <button onClick={() => setShowSeatMap(false)} style={{ background: "none", border: "none", fontSize: 24, color: DS.text3, cursor: "pointer" }}>×</button>
              </div>
              <div style={{ textAlign: "center", padding: "20px 0", background: DS.bg, borderRadius: 16 }}>
                {/* Mockup visual de um ônibus */}
                <div style={{ width: 120, height: 240, border: `2px solid ${DS.borderMd}`, borderRadius: "20px 20px 8px 8px", margin: "0 auto", position: "relative" }}>
                  <div style={{ position: "absolute", top: 10, left: 10, right: 10, height: 30, background: "rgba(0,0,0,0.05)", borderRadius: 8 }} />
                  {/* Assento 18 destacado */}
                  <div style={{ position: "absolute", top: 120, right: 15, width: 24, height: 24, background: DS.primary, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>{nextTrip?.seat ?? "--"}</span>
                  </div>
                  {/* Outros assentos genéricos */}
                  {[60, 90, 120, 150, 180].map(y => (
                    <div key={y} style={{ position: "absolute", top: y, left: 15, width: 24, height: 24, background: DS.borderMd, borderRadius: 6 }} />
                  ))}
                  <div style={{ position: "absolute", bottom: -20, left: 0, right: 0, fontSize: 10, color: DS.text3 }}>FRENTE DO VEÍCULO</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </Screen>
  );
}
