import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BackHeader, BtnPrimary, BtnGhost } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { luggageApi, passengerApi, TicketDetails } from "../../services/api";
import { nfcService } from "../../services/nfc";
import { cityOf } from "../../services/format";

type RegMode = "code" | "nfc";

export function RegistrarBagemScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();

  const [tickets, setTickets] = useState<TicketDetails[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [mode, setMode] = useState<RegMode>("code");

  const [customCode, setCustomCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [createdBagId, setCreatedBagId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const nfcSupport = nfcService.checkSupport();

  const generateHexId = () => {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  };

  useEffect(() => {
    setCustomCode(generateHexId());

    async function loadTickets() {
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
          const activeTickets = userTickets.filter(t => t.used !== 1);
          const list = activeTickets.length > 0 ? activeTickets : userTickets;
          setTickets(list);
          if (list.length > 0) {
            setSelectedTicketId(list[0].ticketId);
          }
        }
      } catch (err) {
        console.warn("Aviso ao carregar bilhetes:", err);
      }
    }
    loadTickets();
  }, []);

  const selectedTicket = tickets.find(t => t.ticketId === selectedTicketId) || tickets[0] || null;

  const handleRegister = async () => {
    if (!selectedTicket?.ticketId) {
      setErrorMessage("Nenhum bilhete ativo selecionado para vincular a bagagem.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const newBaggageId = customCode.trim().length >= 16 ? customCode.trim() : generateHexId();

    // 1. Gravação física se o modo for NFC e suportado
    if (mode === "nfc" && nfcSupport.isSupported) {
      triggerFeedback("neutral", "Aproxime a tag física NFC para gravar");
      try {
        const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout")), 2000));
        await Promise.race([nfcService.writeBaggageTag(newBaggageId), timeoutPromise]);
      } catch (nfcErr: any) {
        console.warn("Aviso na gravação física NFC (prosseguindo com registro no sistema):", nfcErr);
      }
    }

    // 2. Persistência no Oracle associada ao UT_HASH do bilhete
    try {
      await luggageApi.addLuggage(selectedTicket.ticketId, newBaggageId);
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 20px 30px", overflowY: "auto" }}>
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <div style={{ textAlign: "center", padding: "20px 0 14px" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: DS.primaryLight,
                    border: `2px solid ${DS.primaryMid}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.primary} strokeWidth="2" />
                    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: DS.text1, letterSpacing: "-0.3px" }}>
                  Vincular Nova Bagagem
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: DS.text2, lineHeight: 1.4 }}>
                  Escolha o método para identificar sua mala e associá-la à sua viagem.
                </p>
              </div>

              {/* Seletor de Viagem caso haja mais de 1 */}
              {tickets.length > 1 && (
                <div style={{ width: "100%", marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: DS.text3, textTransform: "uppercase", marginBottom: 6 }}>
                    Selecione a Viagem
                  </label>
                  <select
                    value={selectedTicketId}
                    onChange={(e) => setSelectedTicketId(e.target.value)}
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 10,
                      border: `1px solid ${DS.border}`,
                      background: DS.surface,
                      color: DS.text1,
                      fontSize: 13,
                      padding: "0 10px",
                      fontWeight: 600,
                    }}
                  >
                    {tickets.map((t) => (
                      <option key={t.ticketId} value={t.ticketId}>
                        {cityOf(t.departure)} → {cityOf(t.arrival)} (Poltrona {t.seat})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Detalhe do bilhete selecionado */}
              {selectedTicket && (
                <div
                  style={{
                    width: "100%",
                    background: DS.surface,
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 16,
                    border: `1px solid ${DS.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.text1 }}>
                      {cityOf(selectedTicket.departure)} → {cityOf(selectedTicket.arrival)}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: DS.text2 }}>
                      Passageiro: {selectedTicket.passengerName} · Poltrona {selectedTicket.seat}
                    </p>
                  </div>
                </div>
              )}

              {/* Seletor de Modo (Código vs NFC) */}
              <div style={{
                display: "flex",
                width: "100%",
                background: DS.surface,
                borderRadius: 12,
                border: `1px solid ${DS.border}`,
                padding: 4,
                marginBottom: 16,
              }}>
                <button
                  type="button"
                  onClick={() => setMode("code")}
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 8,
                    border: "none",
                    background: mode === "code" ? DS.primary : "transparent",
                    color: mode === "code" ? "#FFF" : DS.text2,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Por Código / Etiqueta
                </button>
                <button
                  type="button"
                  onClick={() => setMode("nfc")}
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 8,
                    border: "none",
                    background: mode === "nfc" ? DS.primary : "transparent",
                    color: mode === "nfc" ? "#FFF" : DS.text2,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Por Tag NFC Física
                </button>
              </div>

              {/* Conteúdo do Modo Código */}
              {mode === "code" && (
                <div style={{ width: "100%", background: DS.surface, borderRadius: 14, padding: "14px", border: `1px solid ${DS.border}`, marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: DS.text3, textTransform: "uppercase", marginBottom: 6 }}>
                    Código da Etiqueta de Bagagem
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                      placeholder="Identificador da Mala"
                      style={{
                        flex: 1,
                        height: 44,
                        borderRadius: 10,
                        border: `1px solid ${DS.border}`,
                        background: DS.bg,
                        color: DS.text1,
                        fontSize: 12,
                        padding: "0 10px",
                        fontFamily: "monospace",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setCustomCode(generateHexId())}
                      style={{
                        height: 44,
                        padding: "0 12px",
                        borderRadius: 10,
                        background: DS.primaryLight,
                        color: DS.primary,
                        border: `1px solid ${DS.primaryMid}`,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Gerar Novo
                    </button>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: DS.text3 }}>
                    Código gerado automaticamente para vinculação imediata no sistema.
                  </p>
                </div>
              )}

              {/* Conteúdo do Modo NFC */}
              {mode === "nfc" && (
                <div style={{
                  width: "100%",
                  borderRadius: 14,
                  padding: "14px",
                  marginBottom: 16,
                  background: nfcSupport.isSupported ? "rgba(5,150,105,0.08)" : "rgba(245,158,11,0.1)",
                  border: `1px solid ${nfcSupport.isSupported ? DS.success : "#F59E0B"}`,
                  textAlign: "center",
                }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: nfcSupport.isSupported ? DS.success : "#B45309" }}>
                    {nfcSupport.isSupported ? "Web NFC Habilitado" : "NFC Físico Não Detectado"}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: DS.text2, lineHeight: 1.4 }}>
                    {nfcSupport.isSupported
                      ? "Ao confirmar, aproxime a tag NFC física da mala na traseira do celular."
                      : "Seu navegador atual não tem suporte a Web NFC. Você pode registrar a mala usando o modo 'Por Código / Etiqueta'."}
                  </p>
                </div>
              )}

              {errorMessage && (
                <div style={{ width: "100%", padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: `1px solid ${DS.error}`, borderRadius: 12, marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: DS.error, textAlign: "center" }}>{errorMessage}</p>
                </div>
              )}

              <div style={{ flex: 1 }} />

              <div style={{ width: "100%", paddingTop: 10 }}>
                <BtnPrimary
                  label={loading ? "Registrando no sistema..." : mode === "code" ? "Registrar Bagagem por Código" : "Gravar e Vincular Tag NFC"}
                  disabled={loading}
                  onClick={handleRegister}
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
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${DS.success}, #16a34a)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(5,150,105,0.4)",
                }}
              >
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: DS.text1, letterSpacing: "-0.4px" }}>
                  Bagagem Registrada com Sucesso!
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: DS.text2 }}>
                  Sua mala já está vinculada à viagem e salva no sistema.
                </p>
              </div>

              <div style={{ background: DS.surface, borderRadius: 14, border: `1px solid ${DS.border}`, padding: "16px", width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: DS.text2 }}>ID Bagagem:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: DS.primary, fontFamily: "monospace" }}>
                    {createdBagId.slice(0, 16)}...
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: DS.text2 }}>Status do Vínculo:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>✓ Salvo no Oracle</span>
                </div>
              </div>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                <BtnPrimary label="Ver Minhas Bagagens" onClick={() => nav("/bagagens")} />
                <BtnGhost label="+ Adicionar Outra Bagagem" onClick={() => { setDone(false); setCustomCode(generateHexId()); }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
