import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWA } from '../hooks/usePWA';

export function PWAInstallBanner() {
  const { canInstall, isStandalone, isDismissed, installApp, dismissBanner } = usePWA();

  // O banner DEVE aparecer SOMENTE quando:
  // 1. O navegador REALMENTE ofereceu instalação (beforeinstallprompt capturado);
  // 2. Não estiver em standalone;
  // 3. Não tiver sido dispensado pelo usuário.
  if (!canInstall || isStandalone || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
          left: 16,
          right: 16,
          zIndex: 900,
          background: 'linear-gradient(135deg, rgba(26, 12, 48, 0.95), rgba(17, 8, 38, 0.98))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(157, 78, 221, 0.35)',
          borderRadius: 20,
          padding: '14px 16px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(123, 44, 191, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Ícone oficial ÍNTEGRA */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #7B2CBF, #5B1A9F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 8,
            boxShadow: '0 4px 12px rgba(123, 44, 191, 0.35)',
          }}
        >
          <img
            src="/logo-in.png"
            alt="ÍNTEGRA Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Informações */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: "'Space Grotesk', -apple-system, sans-serif",
              letterSpacing: '-0.2px',
            }}
          >
            Instalar o app ÍNTEGRA
          </p>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 11,
              color: '#C4B5FD',
              fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
              lineHeight: 1.25,
            }}
          >
            Acesso rápido à sua passagem e embarque digital
          </p>
        </div>

        {/* Botão de Instalação Real */}
        <button
          onClick={installApp}
          style={{
            padding: '8px 16px',
            height: 36,
            borderRadius: 18,
            border: 'none',
            background: 'linear-gradient(135deg, #9D4EDD, #7B2CBF)',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
            boxShadow: '0 2px 10px rgba(123, 44, 191, 0.4)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Instalar
        </button>

        {/* Botão Dispensar */}
        <button
          onClick={dismissBanner}
          aria-label="Fechar banner de instalação"
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            border: 'none',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#9CA3AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
