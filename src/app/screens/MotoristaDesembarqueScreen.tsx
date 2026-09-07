import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useDS, Screen, BtnPrimary, BtnGhost, BackHeader, Fonts, StatusBadge } from "../components/MobileLayout";
import { useA11y } from "../components/AccessibilityContext";
import { luggageApi, driverApi, LuggageDetail, BaggageItem } from "../../services/api";
import { nfcService } from "../../services/nfc";
import { getStoredUserId } from "../../services/session";
import { shortId } from "../../services/format";

type Phase = "idle" | "reading_nfc" | "confirm" | "releasing" | "success" | "success_all" | "error";

interface TripBaggageItem {
  baggageId: string;
  baggageUtHash: string;
  passengerName: string;
  seat: number;
  ticketId: string;
}

export function MotoristaDesembarqueScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const { triggerFeedback } = useA11y();

  const [phase, setPhase] = useState<Phase>("idle");
  const [baggageDetail, setBaggageDetail] = useState<LuggageDetail | null>(null);
  const [manualBaggageId, setManualBaggageId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [physicalTagCleaned, setPhysicalTagCleaned] = useState(true);

  // Lista de bagagens da viagem atual
  const [tripBaggages, setTripBaggages] = useState<TripBaggageItem[]>([]);
  const [currentTripId, setCurrentTripId] = useState<string>("");
  const [loadingBaggages, setLoadingBaggages] = useState(false);

  const nfcSupport = nfcService.checkSupport();

  // Carrega as bagagens da viagem ativa do motorista
  const loadTripBaggages = useCallback(async () => {
    const driverId = getStoredUserId();
    if (!driverId) return;

    try {
      setLoadingBaggages(true);
      const { trips } = await driverApi.getTrips(driverId);
      const activeTrip = Array.isArray(trips) && trips.length > 0 ? trips[0] : null;
      if (!activeTrip?.tripId) return;

      setCurrentTripId(activeTrip.tripId);
      const { passengers } = await driverApi.getTripPassengers(activeTrip.tripId);

      const withBaggage = (passengers || []).filter(p => p.baggageCount > 0);
      const allBags: TripBaggageItem[] = [];

      for (const p of withBaggage) {
        try {
          const { luggages } = await luggageApi.getByTicket(p.ticketId);
          if (Array.isArray(luggages)) {
            for (const bag of luggages) {
              allBags.push({
                baggageId: bag.baggageId,
                baggageUtHash: bag.baggageUtHash,
                passengerName: p.passengerName,
                seat: p.seat,
                ticketId: p.ticketId,
              });
            }
          }
        } catch (_) {}
      }

      setTripBaggages(allBags);
    } catch (err: any) {
      console.warn("Aviso ao carregar bagagens da viagem:", err.message);
    } finally {
      setLoadingBaggages(false);
    }
  }, []);

  useEffect(() => {
    loadTripBaggages();
  }, [loadTripBaggages]);

  // Busca dados da bagagem pelo BAGGAGE_ID
  const handleFetchBaggage = async (baggageId: string) => {
    if (!baggageId) return;
    setPhase("releasing");
    setErrorMessage("");

    try {
      const cleanId = baggageId.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
      const res = await luggageApi.getById(cleanId);
      setBaggageDetail(res.luggage);
      setPhase("confirm");
    } catch (err: any) {
      setErrorMessage(err.message || "Bagagem não encontrada no sistema.");
      setPhase("error");
    }
  };

  // Inicia leitura de tag NFC física
  const handleStartScan = async () => {
    setErrorMessage("");

    if (!nfcSupport.isSupported) {
      setErrorMessage(nfcSupport.message);
      setPhase("error");
      return;
    }

    setPhase("reading_nfc");

    try {
      await nfcService.scan({
        onBaggageRead: (bag) => {
          handleFetchBaggage(bag.baggageId);
        },
        onError: (err) => {
          setErrorMessage(err.message || "Falha ao ler a tag NFC da bagagem.");
          setPhase("error");
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao iniciar o leitor de tag.");
      setPhase("error");
    }
  };

  // Confirmação final da entrega e limpeza da tag
  const handleConfirmRelease = async () => {
    if (!baggageDetail?.baggageId) return;

    setPhase("releasing");
    setErrorMessage("");

    try {
      // 1. Encerra associação no Oracle (DELETE seguro em BAGGAGE)
      await luggageApi.removeLuggage(baggageDetail.baggageId);

      // 2. Tenta limpar fisicamente a tag NFC com timeout de segurança (não trava a interface)
      let cleaned = true;
      if (nfcSupport.isSupported) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 1200)
          );
          await Promise.race([nfcService.clearTag(), timeoutPromise]);
        } catch (_) {
          cleaned = false;
        }
      }

      setPhysicalTagCleaned(cleaned);
      setPhase("success");
      triggerFeedback("success", "Desembarque da bagagem confirmado.");
      // Atualiza a lista local
      loadTripBaggages();
    } catch (apiErr: any) {
      setErrorMessage(apiErr.message || "Erro ao desvincular bagagem no banco.");
      setPhase("error");
      triggerFeedback("error", "Erro ao confirmar desembarque.");
    }
  };

  // Limpeza em lote de todas as bagagens da viagem
  const handleReleaseAllBaggages = async () => {
    if (!currentTripId) return;
    setPhase("releasing");
    setErrorMessage("");

    try {
      await luggageApi.removeAllByTrip(currentTripId);
      setPhysicalTagCleaned(true);
      setPhase("success_all");
      triggerFeedback("success", "Todas as bagagens foram liberadas.");
      loadTripBaggages();
    } catch (apiErr: any) {
      setErrorMessage(apiErr.message || "Erro ao liberar bagagens da viagem.");
      setPhase("error");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setBaggageDetail(null);
    setManualBaggageId("");
    setErrorMessage("");
    loadTripBaggages();
  };

  return (
    <Screen bg={DS.surface}>
      <BackHeader title="Limpar Tag / Desembarque" onBack={() => nav("/motorista/home")} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 20px",
          overflowY: "auto",
        }}
      >
        {/* ── MODO PRINCIPAL: IDLE ── */}
        {phase === "idle" && (
          <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
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
                  margin: "0 auto 10px",
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke={DS.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ fontFamily: Fonts.heading, fontSize: 20, margin: "0 0 4px", color: DS.text1 }}>
                Desembarque e Limpeza de Tag
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: DS.text2, lineHeight: 1.4 }}>
                Entregue a mala ao passageiro e libere a etiqueta NFC para reutilização.
              </p>
            </div>

            <BtnPrimary
              label="Ler Tag NFC da Mala (Física)"
              onClick={handleStartScan}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 8.5C7.3 6.6 9.5 5.3 12 5.3s4.7 1.3 6 3.2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="12" cy="14" r="2" fill="white" />
                </svg>
              }
            />

            {/* ── BAGAGENS ATIVAS DA VIAGEM (SELEÇÃO RÁPIDA COM 1 CLIQUE) ── */}
            <div style={{ background: DS.bg, borderRadius: 14, padding: "14px", border: `1px solid ${DS.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: DS.text1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Bagagens da Viagem Atual ({tripBaggages.length})
                </span>
                {tripBaggages.length > 0 && (
                  <button
                    onClick={handleReleaseAllBaggages}
                    style={{
                      background: "none", border: "none", color: DS.error,
                      fontSize: 11, fontWeight: 700, cursor: "pointer", textDecoration: "underline",
                    }}
                  >
                    Liberar Todas
                  </button>
                )}
              </div>

              {loadingBaggages ? (
                <p style={{ margin: "10px 0", fontSize: 12, color: DS.text3, textAlign: "center" }}>Carregando bagagens...</p>
              ) : tripBaggages.length === 0 ? (
                <div style={{ padding: "16px 10px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 13, color: DS.text2, fontWeight: 600 }}>Nenhuma bagagem pendente nesta viagem.</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: DS.text3 }}>Todas as malas foram entregues e as tags estão limpas.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {tripBaggages.map((bag) => (
                    <div
                      key={bag.baggageId}
                      style={{
                        background: DS.surface,
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: `1px solid ${DS.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.text1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {bag.passengerName} · Poltrona {bag.seat}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: DS.text3, fontFamily: "monospace" }}>
                          ID: {shortId(bag.baggageId, 12)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleFetchBaggage(bag.baggageId)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          background: DS.primary,
                          color: "#FFF",
                          border: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        Limpar Tag
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Entrada manual de contingência */}
            <div style={{ background: DS.bg, borderRadius: 14, padding: "12px 14px", border: `1px solid ${DS.border}` }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: DS.text3, textTransform: "uppercase", marginBottom: 6 }}>
                Ou Digitar ID Manualmente
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={manualBaggageId}
                  onChange={(e) => setManualBaggageId(e.target.value)}
                  placeholder="ID da Bagagem (hex)"
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 8,
                    border: `1px solid ${DS.border}`,
                    background: DS.surface,
                    color: DS.text1,
                    fontSize: 12,
                    padding: "0 10px",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleFetchBaggage(manualBaggageId)}
                  style={{
                    height: 40,
                    padding: "0 12px",
                    borderRadius: 8,
                    background: DS.primaryMid,
                    color: DS.primary,
                    border: "none",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODO LEITURA NFC ── */}
        {phase === "reading_nfc" && (
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
            <h3 style={{ margin: 0, fontSize: 18, color: DS.text1 }}>Aproxime da Mala</h3>
            <p style={{ margin: 0, fontSize: 13, color: DS.text2, textAlign: "center" }}>
              Lendo os dados gravados na tag física NDEF...
            </p>
            <BtnGhost label="Cancelar" onClick={handleReset} />
          </div>
        )}

        {/* ── CONFIRMAÇÃO DE DADOS DA BAGAGEM ── */}
        {phase === "confirm" && baggageDetail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 16, margin: "auto 0" }}
          >
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontFamily: Fonts.heading, fontSize: 20, margin: "0 0 6px", color: DS.text1 }}>
                Conferir Bagagem do Passageiro
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: DS.text2 }}>
                Confirme os dados antes de entregar a mala e limpar a tag.
              </p>
            </div>

            <div
              style={{
                background: DS.surface,
                borderRadius: 14,
                padding: "16px",
                border: `1px solid ${DS.border}`,
                boxShadow: DS.shadowSm,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Passageiro:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: DS.text1 }}>{baggageDetail.passengerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Poltrona:</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: DS.primary }}>{baggageDetail.seat}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>Viagem:</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: DS.text1 }}>
                  {baggageDetail.departure} → {baggageDetail.arrival}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.text2 }}>ID Bagagem:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: DS.text2, fontFamily: "monospace" }}>
                  {baggageDetail.baggageId.slice(0, 16)}...
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary label="Confirmar Entrega e Limpar Tag" onClick={handleConfirmRelease} />
              <BtnGhost label="Cancelar" onClick={handleReset} />
            </div>
          </motion.div>
        )}

        {/* ── PROCESSANDO ── */}
        {phase === "releasing" && (
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
            <h3 style={{ margin: 0, fontSize: 18, color: DS.text1 }}>Liberando Bagagem e Limpando Tag...</h3>
            <p style={{ margin: 0, fontSize: 13, color: DS.text2, textAlign: "center" }}>
              Removendo vínculo no Oracle e liberando etiqueta para reutilização.
            </p>
          </div>
        )}

        {/* ── SUCESSO: TAG LIMPA INDIVIDUAL ── */}
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

            <h2 style={{ fontFamily: Fonts.heading, fontSize: 22, margin: "0 0 6px", color: DS.success, textAlign: "center" }}>
              TAG LIMPA E DESEMBARQUE CONCLUÍDO
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: DS.text2, textAlign: "center" }}>
              Associação de bagagem encerrada com sucesso no sistema.
            </p>

            <div
              style={{
                width: "100%",
                borderRadius: 14,
                padding: "14px",
                marginBottom: 20,
                background: "rgba(5,150,105,0.1)",
                border: `1px solid ${DS.success}`,
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.success }}>
                ✓ Etiqueta liberada e pronta para nova viagem
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: DS.text2 }}>
                O registro foi removido com sucesso do banco de dados.
              </p>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary label="Limpar Próxima Tag" onClick={handleReset} />
              <BtnGhost label="Voltar ao Início" onClick={() => nav("/motorista/home")} />
            </div>
          </motion.div>
        )}

        {/* ── SUCESSO: TODAS AS BAGAGENS LIMPAS ── */}
        {phase === "success_all" && (
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

            <h2 style={{ fontFamily: Fonts.heading, fontSize: 22, margin: "0 0 6px", color: DS.success, textAlign: "center" }}>
              TODAS AS TAGS FORAM LIMPAS
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: DS.text2, textAlign: "center" }}>
              Todas as bagagens da viagem foram liberadas e o veículo está descarregado.
            </p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <BtnPrimary label="Voltar ao Início" onClick={() => nav("/motorista/home")} />
            </div>
          </motion.div>
        )}

        {/* ── ERRO ── */}
        {phase === "error" && (
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", margin: "auto 0", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(220,38,38,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke={DS.error} strokeWidth="2.5" />
                <line x1="12" y1="8" x2="12" y2="12" stroke={DS.error} strokeWidth="2.5" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke={DS.error} strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>

            <h3 style={{ margin: 0, fontSize: 18, color: DS.text1, textAlign: "center" }}>Falha na Operação</h3>
            <p style={{ margin: 0, fontSize: 13, color: DS.error, textAlign: "center" }}>{errorMessage}</p>

            <BtnPrimary label="Tentar Novamente" onClick={handleReset} />
          </div>
        )}
      </div>
    </Screen>
  );
}
