import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWA } from '../hooks/usePWA';

export function PWAInstallBanner() {
  const { canInstall, isStandalone, isDismissed, isIOS, installApp, dismissBanner } = usePWA();
  const [showIosModal, setShowIosModal] = useState(false);

  // Não exibir se já estiver instalado (standalone) ou se o usuário dispensou
  if (isStandalone || isDismissed) {
    return null;
  }

  // No Android/Desktop precisa de canInstall; no iOS mostramos as instruções da Apple
  if (!canInstall && !isIOS) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
            left: 16,
            right: 16,
            maxWidth: 508,
            margin: '0 auto',
            zIndex: 900,
            background: 'linear-gradient(135deg, rgba(26, 12, 48, 0.96), rgba(17, 8, 38, 0.98))',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(157, 78, 221, 0.35)',
            borderRadius: 20,
            padding: '14px 16px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5), 0 0 24px rgba(123, 44, 191, 0.25)',
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
                fontSize: 13,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.2px',
              }}
            >
              {isIOS ? 'Instalar no seu iPhone' : 'Instalar aplicativo'}
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 11,
                color: '#C4B5FD',
                lineHeight: 1.25,
              }}
            >
              {isIOS ? 'Acesse o embarque em tela cheia' : 'Acesso rápido à sua passagem e embarque'}
            </p>
          </div>

          {/* Ação */}
          {isIOS ? (
            <button
              onClick={() => setShowIosModal(true)}
              style={{
                padding: '8px 14px',
                height: 36,
                borderRadius: 18,
                border: 'none',
                background: 'linear-gradient(135deg, #9D4EDD, #7B2CBF)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(123, 44, 191, 0.4)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Como Instalar
            </button>
          ) : (
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
                boxShadow: '0 2px 10px rgba(123, 44, 191, 0.4)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Instalar
            </button>
          )}

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

      {/* Modal explicativo iOS */}
      <AnimatePresence>
        {showIosModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIosModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <motion.div
              initial={{ y: 80, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 80, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 420,
                background: '#13131F',
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '24px 20px',
                color: '#FFF',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              }}
            >
              <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800 }}>
                Como instalar no seu iPhone:
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(123,44,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </div>
                <div style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.4 }}>
                  1. Toque no botão <strong>Compartilhar</strong> na barra do Safari ou Chrome (ícone de quadrado com seta para cima ⬆️).
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.4 }}>
                  2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.
                </div>
              </div>

              <button
                onClick={() => setShowIosModal(false)}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 12,
                  border: 'none',
                  background: '#7B2CBF',
                  color: '#FFF',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Entendi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
