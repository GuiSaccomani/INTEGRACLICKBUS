import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useDS } from "./MobileLayout";

interface QRCodeRendererProps {
  value: string;
  size?: number;
  altText?: string;
  className?: string;
}

/**
 * Componente dinâmico que gera QR Code real via Canvas / SVG usando a biblioteca 'qrcode'.
 * Substitui os desenhos manuais estáticos por um código escaneável autêntico.
 */
export function QRCodeRenderer({ value, size = 180, altText = "QR Code de Embarque", className }: QRCodeRendererProps) {
  const DS = useDS();
  const [dataUrl, setDataUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!value || typeof value !== "string" || value.trim().length === 0) {
      setDataUrl("");
      return;
    }

    QRCode.toDataURL(value.trim(), {
      width: size * 2, // Maior resolução para densidade de pixels Retina
      margin: 1,
      color: {
        dark: "#110826", // Roxo bem escuro do tema
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Erro ao gerar QR Code dinâmico:", err);
        if (isMounted) {
          setError("Não foi possível gerar o código");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (error) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 16,
          background: DS.surface,
          border: `1px solid ${DS.error}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 12, color: DS.error, fontWeight: 600 }}>{error}</span>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 16,
          background: "rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: `3px solid ${DS.primaryMid}`,
            borderTopColor: DS.primary,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        padding: 10,
        background: "#FFFFFF",
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        border: `1px solid ${DS.border}`,
      }}
    >
      <img
        src={dataUrl}
        alt={altText}
        width={size}
        height={size}
        style={{
          display: "block",
          borderRadius: 8,
          objectFit: "contain",
        }}
      />
    </div>
  );
}
