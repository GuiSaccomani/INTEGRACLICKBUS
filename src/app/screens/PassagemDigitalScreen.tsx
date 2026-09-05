import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, BackHeader, StatusBadge, BtnPrimary, BtnGhost } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { passengerApi, TicketDetails } from "../../services/api";
import { QRCodeRenderer } from "../components/QRCodeRenderer";
import { nfcService } from "../../services/nfc";
import { playValidationSuccessSound, triggerSuccessHaptic } from "../../services/sound";
import { AddToWalletButton } from "../components/AddToWalletButton";

const TIMELINE_STEPS = [
  { label: "Passagem confirmada", sub: "Compra identificada no sistema", done: true },
  { label: "Check-in realizado", sub: "Passageiro confirmado", done: true },
  { label: "Embarque", sub: "Apresente o QR Code ou NFC suportado", done: false },
  { label: "Bagagem", sub: "Vinculada à passagem via UT_HASH", done: false },
];

export function PassagemDigitalScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();
  const [flipped, setFlipped] = useState(false);
  const [ticketData, setTicketData] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificação de suporte real ao Web NFC
  const nfcSupport = nfcService.checkSupport();

  useEffect(() => {
    async function loadTicket() {
      setLoading(true);
      try {
        const savedUser = localStorage.getItem("integra_user");
        let userId = "";
        if (savedUser) {
          try {
            userId = JSON.parse(savedUser).userId;
          } catch (_) {}
        }

        if (userId) {
          const userTickets = await passengerApi.getUserTickets(userId).catch(() => []);
          if (userTickets.length > 0) {
            setTicketData(userTickets[0]);
            setLoading(false);
            return;
          }
        }
      } catch (err: any) {
        console.warn("Aviso ao carregar bilhete:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, []);

  const passengerName = ticketData?.passengerName || "Passageiro";
  const departureCity = ticketData?.departure || "São Paulo";
  const arrivalCity = ticketData?.arrival || "Rio de Janeiro";
  const seatNumber = ticketData?.seat ? String(ticketData.seat) : "18";
  const isUsed = ticketData?.used === 1;

  // Referência segura para validação (UT_HASH ou Ticket ID - sem dados confidenciais)
  const credentialRef = ticketData?.utHash || ticketData?.ticketId || "INTEGRA-DEMO";

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Minha Passagem" onBack={() => nav("/home")} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "14px 16px 0" }}>
          {/* Badge segurança */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z" stroke={DS.success} strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke={DS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: DS.success, letterSpacing: "0.3px" }}>
              Credencial protegida · Validação segura no sistema
            </span>
          </div>

          {/* Seletor em Abas (Passagem vs QR Code) */}
          <div
            style={{
              display: "flex",
              background: DS.surface,
              borderRadius: 14,
              padding: 4,
              border: `1px solid ${DS.border}`,
              marginBottom: 16,
              boxShadow: DS.shadowXs,
            }}
          >
            <button
              type="button"
              onClick={() => setFlipped(false)}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 10,
                border: "none",
                background: !flipped ? DS.primary : "transparent",
                color: !flipped ? "#fff" : DS.text2,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.2s ease",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Passagem Digital
            </button>

            <button
              type="button"
              onClick={() => setFlipped(true)}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 10,
                border: "none",
                background: flipped ? DS.primary : "transparent",
                color: flipped ? "#fff" : DS.text2,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.2s ease",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
                <path d="M14 14h6v6h-6v-6z" fill="currentColor" />
              </svg>
              QR Code de Embarque
            </button>
          </div>

          {/* 3D Flip card */}
          <div style={{ perspective: "1200px", width: "100%", height: 340, marginBottom: 16 }}>
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ transformStyle: "preserve-3d", width: "100%", height: "100%", position: "relative" }}
            >
              {/* FRONT — Passagem Digital */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  position: "absolute",
                  inset: 0,
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: DS.shadowMd,
                  border: `1px solid ${DS.border}`,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    background: DS.surface,
                    borderBottom: `1px dashed ${DS.border}`,
                    padding: "22px 20px",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>Passageiro</p>
                      <p style={{ margin: "3px 0 0", fontSize: 17, fontWeight: 800, color: DS.text1, letterSpacing: "-0.3px" }}>{passengerName}</p>
                    </div>
                    <StatusBadge label={isUsed ? "Embarcado" : "Pronto"} kind={isUsed ? "primary" : "success"} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 10, color: DS.text3 }}>ORIGEM</p>
                      <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 900, color: DS.text1, letterSpacing: "-0.6px" }}>
                        {departureCity.slice(0, 3).toUpperCase()}
                      </p>
                      <p style={{ margin: "1px 0 0", fontSize: 11, color: DS.text2 }}>{departureCity}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: 9, color: DS.text3, marginTop: 2 }}>Viagem</span>
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 10, color: DS.text3 }}>DESTINO</p>
                      <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 900, color: DS.text1, letterSpacing: "-0.6px" }}>
                        {arrivalCity.slice(0, 3).toUpperCase()}
                      </p>
                      <p style={{ margin: "1px 0 0", fontSize: 11, color: DS.text2 }}>{arrivalCity}</p>
                    </div>
                  </div>
                </div>
                <div style={{ background: DS.bg, padding: "14px 20px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", marginBottom: 12 }}>
                    {[
                      {
                        label: "Data",
                        value: ticketData?.tripDate
                          ? new Date(ticketData.tripDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase()
                          : "HOJE",
                      },
                      { label: "Horário", value: "14:30" },
                      { label: "Poltrona", value: seatNumber },
                      { label: "Status", value: isUsed ? "Utilizado" : "Ativo" },
                    ].map((f, i, a) => (
                      <div key={f.label} style={{ flex: 1, textAlign: "center", borderRight: i < a.length - 1 ? `1px solid ${DS.border}` : "none" }}>
                        <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase" }}>{f.label}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 800, color: DS.text1 }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={DS.text3} strokeWidth="2" />
                      <circle cx="12" cy="9" r="2.5" stroke={DS.text3} strokeWidth="2" />
                    </svg>
                    <span style={{ fontSize: 12, color: DS.text2 }}>Plataforma de Embarque · Apresente ao motorista</span>
                  </div>
                </div>
              </div>

              {/* BACK — QR Code Real Dinâmico */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  position: "absolute",
                  inset: 0,
                  transform: "rotateY(180deg)",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: DS.shadowMd,
                  background: DS.surface,
                  border: `1px solid ${DS.border}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                }}
              >
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: DS.text1 }}>QR Code de Embarque</p>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: DS.text3 }}>Apresente este código para leitura do motorista</p>
                
                <QRCodeRenderer value={credentialRef} size={150} altText="QR Code da Credencial" />

                <p style={{ margin: "10px 0 0", fontSize: 11, fontWeight: 700, color: DS.text2, fontFamily: "monospace", letterSpacing: "1px" }}>
                  Ref: {credentialRef.slice(0, 12)}...
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: DS.text3 }}>Apresente este código ao leitor no momento do embarque</p>
              </div>
            </motion.div>
          </div>

          {/* ── BOTÃO ADICIONAR À CARTEIRA ── */}
          <div style={{ marginBottom: 16 }}>
            <AddToWalletButton
              passengerName={passengerName}
              departure={departureCity}
              arrival={arrivalCity}
              seat={seatNumber}
              ticketCode={ticketData?.ticketId || "ITG-4829-SP"}
              qrValue={credentialRef}
            />
          </div>

          {/* ── PRÓXIMO PASSO: INSTRUÇÕES DE VALIDAÇÃO (NFC & QR) ── */}
          <div
            style={{
              background: DS.surface,
              border: `1px solid ${DS.border}`,
              borderRadius: 14,
              padding: "18px 18px 16px",
              marginBottom: 16,
              boxShadow: DS.shadowXs,
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: DS.primary, letterSpacing: "0.6px", textTransform: "uppercase" }}>
              Forma de Validação
            </p>

            {nfcSupport.isSupported ? (
              <>
                <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: DS.text1, lineHeight: 1.4 }}>
                  Credencial pronta. No navegador Web, apresente o QR Code ao motorista ou valide por NFC.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: DS.success, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>Web NFC ativo no dispositivo</span>
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: DS.text1, lineHeight: 1.4 }}>
                  NFC não está disponível neste dispositivo.
                </p>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: DS.text2, lineHeight: 1.4 }}>
                  Apresente o QR Code de Embarque diretamente ao motorista.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B" }}>QR Code é o método de embarque oficial</span>
                </div>
              </>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary
                label={flipped ? "Ver dados da passagem" : "Apresentar QR Code de Embarque"}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="6" height="6" rx="1" stroke="white" strokeWidth="2" />
                    <rect x="14" y="4" width="6" height="6" rx="1" stroke="white" strokeWidth="2" />
                    <rect x="4" y="14" width="6" height="6" rx="1" stroke="white" strokeWidth="2" />
                    <path d="M14 14h6v6h-6v-6z" fill="white" />
                  </svg>
                }
                onClick={() => {
                  const newState = !flipped;
                  triggerFeedback("neutral", newState ? "QR Code apresentado ao motorista" : "");
                  setFlipped(newState);
                }}
              />

              <button
                type="button"
                onClick={() => nav("/qrcode")}
                style={{
                  width: "100%",
                  height: 46,
                  borderRadius: 12,
                  border: `1.5px solid ${DS.primaryMid}`,
                  background: DS.primaryLight,
                  color: DS.primary,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Abrir QR Code em Tela Cheia
              </button>

              <button
                type="button"
                onClick={() => nav("/nfc")}
                style={{
                  width: "100%",
                  height: 42,
                  borderRadius: 12,
                  border: `1px solid ${DS.border}`,
                  background: DS.surface,
                  color: DS.text2,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke={DS.text2} strokeWidth="2" strokeLinecap="round" />
                  <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke={DS.text2} strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="14" r="1.5" fill={DS.text2} />
                </svg>
                Validar por aproximação NFC
              </button>
            </div>
          </div>

          {/* ── SUA JORNADA ── */}
          <div
            style={{
              background: DS.surface,
              borderRadius: 14,
              padding: "18px 18px",
              border: `1px solid ${DS.border}`,
              boxShadow: DS.shadowXs,
              marginBottom: 20,
            }}
          >
            <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800, color: DS.text1 }}>Sua jornada</p>
            {TIMELINE_STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 14, position: "relative" }}>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 15,
                      top: 28,
                      width: 2,
                      height: 32,
                      background: step.done ? DS.primary : DS.border,
                      borderRadius: 1,
                    }}
                  />
                )}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: step.done ? DS.primary : DS.surface,
                    border: `2px solid ${step.done ? DS.primary : DS.borderMd}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: i < TIMELINE_STEPS.length - 1 ? 16 : 0,
                    zIndex: 1,
                  }}
                >
                  {step.done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l4 4 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: DS.borderMd }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < TIMELINE_STEPS.length - 1 ? 16 : 0, paddingTop: 4 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: step.done ? DS.text1 : DS.text3 }}>
                    {step.label}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: step.done ? DS.primary : DS.text3 }}>
                    {step.done ? "✓ " : "○ "}
                    {step.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}
