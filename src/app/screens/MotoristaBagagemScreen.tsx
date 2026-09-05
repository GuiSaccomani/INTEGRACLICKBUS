import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, BtnGhost, BackHeader, Fonts } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { luggageApi, driverApi, TripPassenger } from "../../services/api";
import { nfcService } from "../../services/nfc";

type Phase = "idle" | "writing_nfc" | "persisting" | "success" | "error";

export function MotoristaBagagemScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const location = useLocation();
  const { triggerFeedback } = useA11y();

  const [phase, setPhase] = useState<Phase>("idle");
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [selectedPassengerName, setSelectedPassengerName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [createdBaggageId, setCreatedBaggageId] = useState<string>("");

  const nfcSupport = nfcService.checkSupport();

  useEffect(() => {
    // Se veio bilhete específico via navegação (da tela de validação)
    const state = location.state as { ticketId?: string; passengerName?: string } | null;
    if (state?.ticketId) {
      setSelectedTicketId(state.ticketId);
      setSelectedPassengerName(state.passengerName || "Passageiro Selecionado");
    }

    // Carrega passageiros da viagem atual do motorista para seleção se não veio por parâmetro
    async function loadTripPassengers() {
      try {
        const saved = localStorage.getItem("integra_user");
        let driverId = "";
        if (saved) {
          try {
            driverId = JSON.parse(saved).userId;
          } catch (_) {}
        }

        if (driverId) {
          const tripsRes = await driverApi.getTrips(driverId).catch(() => ({ trips: [] }));
          if (tripsRes.trips && tripsRes.trips.length > 0) {
            const currentTrip = tripsRes.trips[0];
            const pRes = await driverApi.getTripPassengers(currentTrip.tripId);
            setPassengers(pRes.passengers || []);

            if (!state?.ticketId && pRes.passengers.length > 0) {
              setSelectedTicketId(pRes.passengers[0].ticketId);
              setSelectedPassengerName(pRes.passengers[0].passengerName);
            }
          }
        }
      } catch (err) {
        console.warn("Aviso ao carregar passageiros da viagem:", err);
      }
    }

    loadTripPassengers();
  }, [location.state]);

  // Gera um ID de bagagem de 64 hex chars RAW(32)
  const generateBaggageHexId = () => {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  };

  const handleLinkBaggage = async () => {
    if (!selectedTicketId) {
      setErrorMessage("Selecione um passageiro para vincular a bagagem.");
      setPhase("error");
      return;
    }

    setErrorMessage("");
    const newBaggageId = generateBaggageHexId();

    // 1. Gravação física na tag se Web NFC for suportado
    if (nfcSupport.isSupported) {
      setPhase("writing_nfc");
      try {
        await nfcService.writeBaggageTag(newBaggageId);
      } catch (nfcErr: any) {
        console.warn("Aviso na gravação física da tag, prosseguindo com vinculação no banco:", nfcErr);
      }
    }

    // 2. Persistência atômica no Oracle vinculada ao UT_HASH
    setPhase("persisting");
    try {
      await luggageApi.addLuggage(selectedTicketId, newBaggageId);
      setCreatedBaggageId(newBaggageId);
      setPhase("success");
      triggerFeedback("success", "Bagagem vinculada e gravada com sucesso.");
    } catch (apiErr: any) {
      setErrorMessage(apiErr.message || "Erro ao registrar a bagagem no sistema.");
      setPhase("error");
      triggerFeedback("error", "Falha na vinculação da bagagem.");
    }
  };

  return (
    <Screen bg={DS.surface}>
      <BackHeader title="Adicionar Bagagem" onBack={() => nav("/motorista/home")} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 24px",
          overflowY: "auto",
        }}
      >
        {phase === "idle" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 18, margin: "auto 0" }}>
            <div style={{ textAlign: "center" }}>
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
                  margin: "0 auto 12px",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.primary} strokeWidth="2" />
                  <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h2 style={{ fontFamily: Fonts.heading, fontSize: 20, margin: "0 0 6px", color: DS.text1 }}>
                Vincular Tag de Bagagem
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: DS.text2, lineHeight: 1.4 }}>
                Aproxime a tag física NFC para gravar a identificação e associar ao bilhete no sistema.
              </p>
            </div>

            {/* Seleção de passageiro */}
            <div style={{ background: DS.bg, padding: 14, borderRadius: 14, border: `1px solid ${DS.border}` }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: DS.text3, textTransform: "uppercase", marginBottom: 6 }}>
                Passageiro Destinatário
              </label>

              {passengers.length > 0 ? (
                <select
                  value={selectedTicketId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setSelectedTicketId(tId);
                    const found = passengers.find((p) => p.ticketId === tId);
                    if (found) setSelectedPassengerName(found.passengerName);
                  }}
                  style={{
                    width: "100%",
                    height: 46,
                    borderRadius: 10,
                    border: `1px solid ${DS.border}`,
                    background: DS.surface,
                    color: DS.text1,
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "0 10px",
                  }}
                >
                  {passengers.map((p) => (
                    <option key={p.ticketId} value={p.ticketId}>
                      Poltrona {p.seat} — {p.passengerName}
                    </option>
                  ))}
                </select>
              ) : (
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1 }}>
                  {selectedPassengerName || "Passageiro Selecionado"}
                </p>
              )}
            </div>

            {/* Status do suporte NFC */}
            <div
              style={{
                borderRadius: 12,
                padding: "10px 14px",
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
                  : "NFC não disponível neste dispositivo. A bagagem será registrada via código seguro no sistema."}
              </span>
            </div>

            <BtnPrimary
              label={nfcSupport.isSupported ? "Gravar e Vincular Tag NFC" : "Registrar Bagagem no Sistema"}
              onClick={handleLinkBaggage}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          </div>
        )}

        {phase === "writing_nfc" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: DS.primaryLight,
                border: `3px solid ${DS.primary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse 1.5s infinite ease-in-out",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                <path d="M8.5 11.5C9.3 10.3 10.6 9.5 12 9.5s2.7.8 3.5 2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="14" r="2" fill={DS.primary} />
              </svg>
            </div>
            <h3 style={{ margin: 0, fontSize: 18, color: DS.text1 }}>Aproxime a Tag NFC Física</h3>
            <p style={{ margin: 0, fontSize: 13, color: DS.text2, textAlign: "center" }}>
              Encoste o celular na tag da mala para gravar o identificador NDEF.
            </p>
          </div>
        )}

        {phase === "persisting" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: `4px solid ${DS.primaryMid}`,
                borderTopColor: DS.primary,
                borderRadius: "50%",
                animation: "spin 0.9s linear infinite",
              }}
            />
            <h3 style={{ margin: 0, fontSize: 18, color: DS.text1 }}>Registrando no sistema...</h3>
            <p style={{ margin: 0, fontSize: 13, color: DS.text2, textAlign: "center" }}>
              Associando bagagem à passagem do passageiro com segurança.
            </p>
          </div>
        )}

        {phase === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0" }}
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
                marginBottom: 16,
                boxShadow: "0 10px 30px rgba(5,150,105,0.4)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: Fonts.heading, fontSize: 22, margin: "0 0 4px", color: DS.success, textAlign: "center" }}>
              BAGAGEM VINCULADA
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: DS.text2, textAlign: "center" }}>
              Registro salvo no sistema e vinculado à viagem do passageiro.
            </p>

            <div
              style={{
                width: "100%",
                background: DS.surface,
                border: `1px solid ${DS.border}`,
                borderRadius: 14,
                padding: "16px",
                marginBottom: 20,
                boxShadow: DS.shadowSm,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Passageiro:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: DS.text1 }}>{selectedPassengerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>BAGGAGE_ID:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: DS.primary, fontFamily: "monospace" }}>
                  {createdBaggageId.slice(0, 16)}...
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Status do Vínculo:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>Vinculado com Sucesso</span>
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary label="Adicionar Outra Bagagem" onClick={() => setPhase("idle")} />
              <BtnGhost label="Concluir" onClick={() => nav("/motorista/home")} />
            </div>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0" }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: DS.error,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: Fonts.heading, fontSize: 20, margin: "0 0 8px", color: DS.error, textAlign: "center" }}>
              FALHA NA OPERAÇÃO
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: DS.text2, textAlign: "center", lineHeight: 1.5 }}>
              {errorMessage || "Erro ao gravar ou vincular a bagagem."}
            </p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary label="Tentar Novamente" onClick={() => setPhase("idle")} />
              <BtnGhost label="Voltar" onClick={() => nav("/motorista/home")} />
            </div>
          </motion.div>
        )}
      </div>
    </Screen>
  );
}
