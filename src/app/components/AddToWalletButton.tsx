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
  const [activeModal, setActiveModal] = useState<"apple" | "google" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("integra_wallet_ticket_added");
      if (saved === "true") {
        setIsAdded(true);
      }
    } catch (_) {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddToAppleWallet = () => {
    playValidationSuccessSound();
    triggerSuccessHaptic();
    setIsAdded(true);

    try {
      localStorage.setItem("integra_wallet_ticket_added", "true");
      localStorage.setItem(
        "integra_wallet_pass_data",
        JSON.stringify({
          provider: "apple",
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

    showToast("Passagem salva na Carteira com sucesso!");
    setActiveModal("apple");
  };

  const handleAddToGoogleWallet = () => {
    playValidationSuccessSound();
    triggerSuccessHaptic();
    setIsAdded(true);

    try {
      localStorage.setItem("integra_wallet_ticket_added", "true");
      localStorage.setItem(
        "integra_wallet_pass_data",
        JSON.stringify({
          provider: "google",
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

    showToast("Passagem vinculada ao Google Wallet com sucesso!");
    setActiveModal("google");
  };

  const handleRemoveFromWallet = () => {
    try {
      localStorage.removeItem("integra_wallet_ticket_added");
      localStorage.removeItem("integra_wallet_pass_data");
    } catch (_) {}
    setIsAdded(false);
    setActiveModal(null);
    triggerSuccessHaptic();
    showToast("Passagem removida da Carteira Digital.");
  };

  const handleDownloadOfflinePass = (type: "apple" | "google") => {
    triggerSuccessHaptic();
    const passPayload = JSON.stringify(
      {
        ticket: ticketCode,
        passenger: passengerName,
        route: `${departure} -> ${arrival}`,
        seat,
        date,
        qr: qrValue,
        format: type === "apple" ? "pkpass" : "google-wallet-pass",
      },
      null,
      2
    );
    const blob = new Blob([passPayload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = type === "apple" ? `integra-ticket-${ticketCode}.pkpass` : `integra-ticket-${ticketCode}.jwt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Bilhete offline (${type === "apple" ? ".pkpass" : ".jwt"}) baixado!`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {/* ── STATUS DA CARTEIRA DIGITAL & BOTÃO DE REMOVER ── */}
      {isAdded && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: 12,
            padding: "8px 12px",
            marginBottom: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 8px #10B981",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>
              Passagem Salva na Carteira
            </span>
          </div>

          <button
            type="button"
            onClick={handleRemoveFromWallet}
            style={{
              background: "transparent",
              border: "none",
              color: "#EF4444",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 6,
              textDecoration: "underline",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Tirar Passagem
          </button>
        </div>
      )}

      {/* ── DUAS OPÇÕES SEMPRE VISÍVEIS: APPLE WALLET E GOOGLE WALLET ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {/* OPÇÃO 1: APPLE WALLET */}
        <button
          type="button"
          onClick={handleAddToAppleWallet}
          style={{
            height: 48,
            borderRadius: 13,
            border: "1px solid #3F3F46",
            background: "#09090B",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
            transition: "transform 0.1s, border-color 0.2s",
            padding: "0 8px",
          }}
          onPointerDown={(e) => {
            e.currentTarget.style.transform = "scale(0.97)";
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {/* Ícone Apple Oficial */}
          <svg width="15" height="15" viewBox="0 0 170 170" fill="currentColor">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.58-6.19-9.46-10.98-20.2-14.37-32.22-3.39-12.02-5.09-23.27-5.09-33.74 0-14.45 3.65-26.66 10.95-36.63 7.3-9.97 16.59-15.08 27.87-15.33 5.43 0 11.24 1.4 17.43 4.2 6.19 2.8 10.42 4.26 12.69 4.38 2.07-.12 6.46-1.63 13.17-4.53 6.71-2.9 12.44-4.22 17.19-3.96 12.98.63 23.36 5.46 31.13 14.49-11.45 6.94-17.06 16.53-16.84 28.77.22 9.53 3.92 17.65 11.1 24.36 4.13 3.93 8.84 6.78 14.13 8.56-2.28 6.84-5.01 13.91-8.19 21.21zM119.22 33.64c0-7.39 2.65-14.19 7.94-20.4 5.29-6.22 11.75-10.37 19.38-12.45.33 1.2.49 2.37.49 3.51 0 7.39-2.73 14.37-8.19 20.94-5.46 6.57-12.02 10.63-19.68 12.18-.11-1.25-.17-2.51-.17-3.78z" />
          </svg>
          <span style={{ whiteSpace: "nowrap" }}>Apple Wallet</span>
        </button>

        {/* OPÇÃO 2: GOOGLE WALLET */}
        <button
          type="button"
          onClick={handleAddToGoogleWallet}
          style={{
            height: 48,
            borderRadius: 13,
            border: "1px solid #3F3F46",
            background: "#18181B",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
            transition: "transform 0.1s, border-color 0.2s",
            padding: "0 8px",
          }}
          onPointerDown={(e) => {
            e.currentTarget.style.transform = "scale(0.97)";
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {/* Ícone Google Wallet 4 Cores */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span style={{ whiteSpace: "nowrap" }}>Google Wallet</span>
        </button>
      </div>

      {/* ── TOAST FLUTUANTE ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: "fixed",
              top: "calc(env(safe-area-inset-top, 0px) + 16px)",
              left: 16,
              right: 16,
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              borderRadius: 16,
              background: "#18181B",
              border: "1.5px solid #10B981",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(16,185,129,0.25)",
              color: "#fff",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(16,185,129,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#10B981" }}>{toastMessage}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#D4D4D8" }}>
                Disponível para embarque imediato no seu smartphone.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL PASSE OFICIAL (APPLE OU GOOGLE WALLET) ── */}
      <AnimatePresence>
        {activeModal && (
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
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                width: "100%",
                maxWidth: 370,
                background: activeModal === "apple" ? "#121214" : "#1A1A1E",
                borderRadius: 24,
                overflow: "hidden",
                border: activeModal === "apple" ? "1px solid rgba(255,255,255,0.15)" : "1px solid #4285F4",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho do Cartão com Marca */}
              <div
                style={{
                  background:
                    activeModal === "apple"
                      ? "linear-gradient(135deg, #18032E 0%, #6B21A8 60%, #9333EA 100%)"
                      : "linear-gradient(135deg, #0D2447 0%, #1A73E8 60%, #4285F4 100%)",
                  padding: "20px 20px 16px",
                  color: "#fff",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 7,
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
                    <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.5px" }}>
                      ÍNTEGRA PASS
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.5px",
                      background: "rgba(255,255,255,0.22)",
                      padding: "3px 9px",
                      borderRadius: 100,
                      textTransform: "uppercase",
                    }}
                  >
                    {activeModal === "apple" ? "Apple Wallet" : "Google Wallet"}
                  </span>
                </div>

                <p style={{ margin: "0 0 2px", fontSize: 10, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Passageiro
                </p>
                <p style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 800 }}>{passengerName}</p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 10, opacity: 0.75, textTransform: "uppercase" }}>
                      Itinerário
                    </p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                      {departure.split(" - ")[0]} → {arrival.split(" - ")[0]}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 10, opacity: 0.75, textTransform: "uppercase" }}>
                      Poltrona
                    </p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#FDE047" }}>{seat}</p>
                  </div>
                </div>
              </div>

              {/* Corpo com QR Code */}
              <div style={{ padding: "20px 20px 22px", textAlign: "center", background: "#18181B" }}>
                <div
                  style={{
                    background: "#FFFFFF",
                    padding: 12,
                    borderRadius: 18,
                    display: "inline-block",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
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
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#10B981" }}>
                    Passe Pronto para Embarque
                  </span>
                </div>

                <p style={{ margin: "0 0 14px", fontSize: 12, color: "#A1A1AA", lineHeight: 1.45 }}>
                  Apresente este bilhete ao leitor do ônibus ou use por aproximação NFC.
                </p>

                {/* Box de Orientação para iPhone e Android */}
                {activeModal === "apple" && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 14,
                      padding: "12px 14px",
                      textAlign: "left",
                      marginBottom: 14,
                    }}
                  >
                    <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>💡</span> Como encontrar no seu iPhone:
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#D4D4D8", lineHeight: 1.45 }}>
                      • O atalho de <b>2 cliques no botão lateral</b> do iPhone é reservado pela Apple para cartões de crédito (Apple Pay).<br />
                      • Para passagens e bilhetes, abra o app <b>Carteira (Wallet)</b> na tela de início do iPhone ou acesse diretamente aqui pelo app!
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      triggerSuccessHaptic();
                      showToast("Passe confirmado na sua Carteira Digital!");
                      setActiveModal(null);
                    }}
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 13,
                      border: "none",
                      background: activeModal === "apple" ? "#FFFFFF" : "#1A73E8",
                      color: activeModal === "apple" ? "#000000" : "#FFFFFF",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                    }}
                  >
                    <span>✓ Pronto para Embarque (Concluir)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
