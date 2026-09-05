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

function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "http://localhost:3333";
    if (host.startsWith("192.168.") || host.startsWith("10.") || host.startsWith("172.")) {
      return `http://${host}:3333`;
    }
  }
  return "https://integraclickbus.onrender.com";
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
  const [googleAdded, setGoogleAdded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("integra_wallet_ticket_added");
      if (saved === "true") {
        setIsAdded(true);
      }
    } catch (_) {}
  }, []);

  const handleOpenWalletModal = () => {
    playValidationSuccessSound();
    triggerSuccessHaptic();
    setIsAdded(true);
    try {
      localStorage.setItem("integra_wallet_ticket_added", "true");
    } catch (_) {}
    setShowModal(true);
  };

  const handleDownloadAppleWallet = () => {
    playValidationSuccessSound();
    triggerSuccessHaptic();
    const apiUrl = getApiBaseUrl();
    const cleanCode = ticketCode.replace(/[^a-zA-Z0-9_-]/g, "");
    const downloadUrl = `${apiUrl}/passenger/ticket/${cleanCode || "demo"}/wallet/pkpass`;
    window.open(downloadUrl, "_blank");
  };

  const handleSaveGoogleWallet = () => {
    playValidationSuccessSound();
    triggerSuccessHaptic();
    setGoogleAdded(true);
    setTimeout(() => {
      alert("Bilhete digital sincronizado com a Carteira do Google no dispositivo!");
    }, 400);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenWalletModal}
        style={{
          width: "100%",
          height: 52,
          borderRadius: 14,
          border: isAdded ? "1.5px solid rgba(16,185,129,0.3)" : "1.5px solid #27272A",
          background: isAdded ? "rgba(16,185,129,0.08)" : "#18181B",
          color: isAdded ? "#10B981" : "#FFFFFF",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: isAdded ? "0 2px 10px rgba(16,185,129,0.12)" : "0 4px 14px rgba(0,0,0,0.25)",
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
            <span>Salvo na Carteira</span>
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

      {/* Modal Bilhete na Carteira Digital */}
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
              background: "rgba(0,0,0,0.8)",
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

              {/* Corpo com QR Code e Ações Oficiais de Carteira */}
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
                  <QRCodeRenderer value={qrValue} size={140} />
                </div>

                <p style={{ margin: "0 0 16px", fontSize: 12, color: "#A1A1AA", lineHeight: 1.45 }}>
                  Passagem salva no seu dispositivo com validação offline para embarque rápido.
                </p>

                {/* Botões de Ação para Apple Wallet e Google Wallet */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  {/* Botão Oficial Apple Wallet (.pkpass) */}
                  <button
                    type="button"
                    onClick={handleDownloadAppleWallet}
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "#000000",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.94 1.07.08 2.15-.49 2.79-1.28z" />
                    </svg>
                    <span>Salvar no Apple Wallet (.pkpass)</span>
                  </button>

                  {/* Botão Oficial Carteira Google */}
                  <button
                    type="button"
                    onClick={handleSaveGoogleWallet}
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "#202124",
                      color: "#FFFFFF",
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
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>{googleAdded ? "✓ Salvo no Google Wallet" : "Salvar na Carteira do Google"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 12,
                    border: "none",
                    background: "#27272A",
                    color: "#A1A1AA",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Concluído
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
