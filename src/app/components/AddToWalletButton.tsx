import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playValidationSuccessSound, triggerSuccessHaptic } from "../../services/sound";
import { QRCodeRenderer } from "./QRCodeRenderer";

interface AddToWalletButtonProps {
  passengerName?: string;
  departure?: string;
  arrival?: string;
  seat?: string | number;
  date?: string;
  ticketCode?: string;
  qrValue?: string;
}

export function AddToWalletButton({
  passengerName = "Guilherme Santos",
  departure = "São Paulo - Tietê",
  arrival = "Rio de Janeiro - Novo Rio",
  seat = "14",
  date = "Amanhã · 14:30",
  ticketCode = "ITG-4829-SP",
  qrValue = "INTEGRA-VALID-TICKET-4829",
}: AddToWalletButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("integra_wallet_ticket_added");
      if (saved === "true") {
        setIsAdded(true);
      }
    } catch (_) {}
  }, []);

  const handleToggleWallet = () => {
    playValidationSuccessSound();
    triggerSuccessHaptic();

    if (!isAdded) {
      // 1. Adiciona instantaneamente à carteira digital do dispositivo
      setIsAdded(true);
      try {
        localStorage.setItem("integra_wallet_ticket_added", "true");
        localStorage.setItem(
          "integra_wallet_pass_data",
          JSON.stringify({
            passengerName,
            departure,
            arrival,
            seat,
            date,
            ticketCode,
            qrValue,
            savedAt: new Date().toISOString(),
          })
        );
      } catch (_) {}

      // Exibe toast de confirmação imediata
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } else {
      // Se já está adicionado, abre o passe em tela cheia para visualização rápida
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Botão de Adição Direta à Carteira (sem redirecionar ou abrir links externos) */}
      <button
        type="button"
        onClick={handleToggleWallet}
        style={{
          width: "100%",
          height: 52,
          borderRadius: 14,
          border: isAdded ? "1.5px solid rgba(16,185,129,0.35)" : "1.5px solid #27272A",
          background: isAdded
            ? "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 100%)"
            : "#18181B",
          color: isAdded ? "#10B981" : "#FFFFFF",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: isAdded ? "0 2px 12px rgba(16,185,129,0.15)" : "0 4px 14px rgba(0,0,0,0.25)",
          transition: "all 0.2s ease",
        }}
        onPointerDown={(e) => {
          e.currentTarget.style.transform = "scale(0.98)";
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isAdded ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#10B981" fillOpacity="0.2" />
              <path d="M8 12l3 3 5-6" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>✓ Salvo na Carteira Digital</span>
            <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>(Ver Passe)</span>
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="15" rx="3" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M2 10h20" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="18" cy="15" r="1.5" fill="#FFFFFF" />
              <path d="M6 3v2M18 3v2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Adicionar à Carteira</span>
          </>
        )}
      </button>

      {/* Toast de Confirmação Imediata */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: "fixed",
              top: "calc(env(safe-area-inset-top, 0px) + 20px)",
              left: 20,
              right: 20,
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              borderRadius: 16,
              background: "#18181B",
              border: "1.5px solid #10B981",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.2)",
              color: "#fff",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(16,185,129,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#10B981" }}>
                Passagem Salva na Carteira!
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#D4D4D8" }}>
                Disponível para embarque imediato mesmo offline.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Visualização do Passe na Carteira Digital */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 24, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              style={{
                width: "100%",
                maxWidth: 370,
                background: "#18181B",
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho do Passe */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1A0533 0%, #7B2CBF 60%, #9D4EDD 100%)",
                  padding: "20px 20px 16px",
                  color: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: 12,
                      }}
                    >
                      IN
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.5px" }}>ÍNTEGRA PASS</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 100 }}>
                    CARTEIRA DIGITAL
                  </span>
                </div>

                <p style={{ margin: "0 0 2px", fontSize: 11, opacity: 0.7, textTransform: "uppercase" }}>Passageiro</p>
                <p style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800 }}>{passengerName}</p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 10, opacity: 0.7, textTransform: "uppercase" }}>Itinerário</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                      {departure.split(" - ")[0]} → {arrival.split(" - ")[0]}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 10, opacity: 0.7, textTransform: "uppercase" }}>Poltrona</p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{seat}</p>
                  </div>
                </div>
              </div>

              {/* Corpo com QR Code */}
              <div style={{ padding: "20px 20px 24px", textAlign: "center", background: "#18181B" }}>
                <div
                  style={{
                    background: "#FFFFFF",
                    padding: 12,
                    borderRadius: 16,
                    display: "inline-block",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    marginBottom: 14,
                  }}
                >
                  <QRCodeRenderer value={qrValue} size={150} />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#10B981" />
                    <path d="M8 12l3 3 5-6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#10B981" }}>Passe Ativo na Carteira</span>
                </div>

                <p style={{ margin: "0 0 20px", fontSize: 12, color: "#A1A1AA", lineHeight: 1.45 }}>
                  Apresente este bilhete ao motorista para validação rápida no embarque.
                </p>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 14,
                    border: "none",
                    background: "#27272A",
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
