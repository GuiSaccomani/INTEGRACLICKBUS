import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BackHeader, BtnPrimary, BtnGhost } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { luggageApi, passengerApi, TicketDetails } from "../../services/api";
import { nfcService } from "../../services/nfc";

export function RegistrarBagemScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();

  const [ticketData, setTicketData] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [createdBagId, setCreatedBagId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const nfcSupport = nfcService.checkSupport();

  useEffect(() => {
    async function loadTicket() {
      try {
        const savedUser = localStorage.getItem("integra_user");
        let userId = "";
        if (savedUser) {
          try {
            userId = JSON.parse(savedUser).userId;
          } catch (_) {}
        }
        if (userId) {
          const tickets = await passengerApi.getUserTickets(userId).catch(() => []);
          if (tickets.length > 0) {
            setTicketData(tickets[0]);
          }
        }
      } catch (err) {
        console.warn("Aviso ao carregar bilhete do passageiro:", err);
      }
    }
    loadTicket();
  }, []);

  const generateBaggageHexId = () => {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  };

  const handleRegister = async () => {
    if (!ticketData?.ticketId) {
      setErrorMessage("Nenhum bilhete ativo encontrado para vincular a bagagem.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const newBaggageId = generateBaggageHexId();

    // 1. Gravação na tag física se suportado
    if (nfcSupport.isSupported) {
      triggerFeedback("neutral", "Aproxime o celular da tag física da bagagem");
      try {
        await nfcService.writeBaggageTag(newBaggageId);
      } catch (nfcErr: any) {
        console.warn("Aviso na gravação física da tag, prosseguindo com vinculação no banco:", nfcErr);
      }
    }

    // 2. Persistência atômica no Oracle (associando ao UT_HASH)
    try {
      await luggageApi.addLuggage(ticketData.ticketId, newBaggageId);
      setCreatedBagId(newBaggageId);
      setDone(true);
      triggerFeedback("success", "Bagagem vinculada com sucesso no sistema.");
    } catch (apiErr: any) {
      setErrorMessage(apiErr.message || "Erro ao registrar bagagem no sistema.");
      triggerFeedback("error", "Erro ao registrar bagagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Adicionar Bagagem" onBack={() => nav("/bagagens")} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 20px" }}>
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <div style={{ textAlign: "center", padding: "28px 0 16px" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: DS.primaryLight,
                    border: `2px solid ${DS.primaryMid}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.primary} strokeWidth="2" />
                    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: DS.text1, letterSpacing: "-0.4px" }}>
                  Registrar Bagagem
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: DS.text2, lineHeight: 1.5 }}>
                  A bagagem será vinculada à sua passagem com segurança.
                </p>
              </div>

              {/* Informações do bilhete vinculado */}
              <div
                style={{
                  width: "100%",
                  background: DS.surface,
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 16,
                  border: `1px solid ${DS.border}`,
                  boxShadow: DS.shadowXs,
                }}
              >
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: DS.text3, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Vinculada à Viagem
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1 }}>
                      {ticketData?.departure || "São Paulo"} → {ticketData?.arrival || "Rio de Janeiro"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: DS.text2 }}>
                      Poltrona {ticketData?.seat || "18"} · Bilhete Oficial
                    </p>
                  </div>
                </div>
              </div>

              {/* Status de NFC */}
              <div
                style={{
                  width: "100%",
                  borderRadius: 12,
                  padding: "10px 14px",
                  marginBottom: 20,
                  background: nfcSupport.isSupported ? "rgba(5,150,105,0.1)" : "rgba(245,158,11,0.1)",
                  border: `1px solid ${nfcSupport.isSupported ? DS.success : "#F59E0B"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: nfcSupport.isSupported ? DS.success : "#F59E0B",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, color: DS.text1, lineHeight: 1.4 }}>
                  {nfcSupport.isSupported
                    ? "Web NFC disponível para gravação em tag física NDEF."
                    : "NFC não disponível neste navegador. A bagagem será registrada via código seguro no sistema."}
                </span>
              </div>

              {errorMessage && (
                <div style={{ width: "100%", padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: `1px solid ${DS.error}`, borderRadius: 12, marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: DS.error, textAlign: "center" }}>{errorMessage}</p>
                </div>
              )}

              <div style={{ flex: 1 }} />

              <div style={{ width: "100%", paddingBottom: 32 }}>
                <BtnPrimary
                  label={loading ? "Gravando e vinculando..." : nfcSupport.isSupported ? "Gravar Tag NFC da Mala" : "Registrar Bagagem no Sistema"}
                  disabled={loading}
                  onClick={handleRegister}
                  icon={
                    !loading && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )
                  }
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${DS.success}, #16a34a)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(5,150,105,0.4)",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: DS.text1, letterSpacing: "-0.4px" }}>
                  Bagagem Vinculada ao Passageiro
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: DS.text2 }}>
                  Registrada no sistema com sucesso.
                </p>
              </div>

              <div style={{ background: DS.surface, borderRadius: 14, border: `1px solid ${DS.border}`, padding: "16px", width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: DS.text2 }}>BAGGAGE_ID:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: DS.primary, fontFamily: "monospace" }}>
                    {createdBagId.slice(0, 16)}...
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: DS.text2 }}>Status do Vínculo:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>Vinculada com Sucesso</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: DS.text2 }}>Status:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: DS.text1 }}>Registrada</span>
                </div>
              </div>

              <BtnPrimary label="Ver Minhas Bagagens" onClick={() => nav("/bagagens")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
