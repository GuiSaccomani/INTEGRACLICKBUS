import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useDS, BtnPrimary, BtnGhost } from "./MobileLayout";

interface QRCodeCameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onCancel?: () => void;
}

export function QRCodeCameraScanner({ onScanSuccess, onCancel }: QRCodeCameraScannerProps) {
  const DS = useDS();
  const readerElementId = "qr-reader-container";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      try {
        setErrorMessage(null);
        const scanner = new Html5Qrcode(readerElementId);
        scannerRef.current = scanner;

        // Tenta usar câmera traseira ('environment')
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              // Quando detectar um QR code com sucesso
              scanner
                .stop()
                .then(() => {
                  setCameraActive(false);
                  onScanSuccess(decodedText);
                })
                .catch(() => {
                  onScanSuccess(decodedText);
                });
            }
          },
          () => {
            // Callback de leitura frame a frame (ignora falhas normais entre frames)
          }
        );

        if (isMounted) {
          setCameraActive(true);
        }
      } catch (err: any) {
        console.warn("⚠️ Erro ao iniciar câmera:", err);
        if (isMounted) {
          setCameraActive(false);
          if (err?.name === "NotAllowedError" || String(err).includes("Permission")) {
            setErrorMessage("Acesso à câmera não autorizado. Permita o uso da câmera no navegador para escanear o QR Code.");
          } else if (err?.name === "NotFoundError" || String(err).includes("device")) {
            setErrorMessage("Nenhuma câmera encontrada neste dispositivo. Utilize a entrada manual da credencial.");
          } else {
            setErrorMessage("Não foi possível iniciar a câmera. Verifique as permissões ou digite a credencial manualmente.");
          }
        }
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (_) {}
      }
    };
  }, [onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScanSuccess(manualInput.trim());
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Container de vídeo da câmera */}
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          borderRadius: 20,
          overflow: "hidden",
          border: `2px solid ${cameraActive ? DS.primary : DS.border}`,
          position: "relative",
          background: "#000",
          boxShadow: DS.shadowMd,
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div id={readerElementId} style={{ width: "100%", height: "100%" }} />

        {!cameraActive && !errorMessage && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "#FFF",
              background: "rgba(0,0,0,0.8)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                border: `3px solid rgba(255,255,255,0.2)`,
                borderTopColor: DS.primary,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Iniciando câmera...</span>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(17,8,38,0.95)",
              textAlign: "center",
              gap: 12,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke={DS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ margin: 0, fontSize: 13, color: DS.text1, lineHeight: 1.4 }}>
              {errorMessage}
            </p>
          </div>
        )}
      </div>

      {/* Orientações */}
      <p style={{ margin: "14px 0 0", fontSize: 13, color: DS.text2, textAlign: "center" }}>
        Aponte a câmera para o QR Code apresentado pelo passageiro.
      </p>

      {/* Botão para gravação de vídeo / demonstração rápida */}
      <button
        type="button"
        onClick={() => onScanSuccess("INTEGRA-QR-TICKET-DEMO")}
        style={{
          marginTop: 14,
          width: "100%",
          height: 44,
          borderRadius: 12,
          border: `1.5px dashed ${DS.success}`,
          background: "rgba(16, 185, 129, 0.08)",
          color: DS.success,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 0.2s",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5L20 7" stroke={DS.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Simular Leitura do QR Code (Gravação do Vídeo)
      </button>

      {/* Contingência de digitação manual */}
      <div style={{ width: "100%", marginTop: 14 }}>
        {!showManualInput ? (
          <button
            type="button"
            onClick={() => setShowManualInput(true)}
            style={{
              background: "none",
              border: "none",
              color: DS.primary,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
              display: "block",
              margin: "0 auto 12px",
            }}
          >
            Digitar código da credencial manualmente
          </button>
        ) : (
          <form onSubmit={handleManualSubmit} style={{ width: "100%", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Código UT_HASH ou Ticket ID"
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: `1.5px solid ${DS.border}`,
                  padding: "0 14px",
                  background: DS.surface,
                  color: DS.text1,
                  fontSize: 14,
                  fontFamily: "monospace",
                }}
              />
              <button
                type="submit"
                style={{
                  height: 48,
                  padding: "0 18px",
                  borderRadius: 12,
                  background: DS.primary,
                  color: "#FFF",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Validar
              </button>
            </div>
          </form>
        )}

        {onCancel && (
          <BtnGhost label="Cancelar escaneamento" onClick={onCancel} style={{ marginTop: 6 }} />
        )}
      </div>
    </div>
  );
}
