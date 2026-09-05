import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setReconnected(true);
      const timer = setTimeout(() => {
        setReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setReconnected(false);
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          key="offline-alert"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          role="alert"
          aria-live="assertive"
          style={{
            position: 'absolute',
            top: 'env(safe-area-inset-top, 0px)',
            left: 0,
            right: 0,
            zIndex: 999,
            padding: '10px 16px',
            background: 'linear-gradient(135deg, rgba(30, 10, 20, 0.96), rgba(45, 12, 25, 0.96))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.35)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {/* Ícone de Wi-Fi desconectado */}
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 600,
              color: '#FECACA',
              fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
              lineHeight: 1.35,
              textAlign: 'left',
            }}
          >
            Sem conexão com a internet. Os serviços de validação necessitam de rede ativa.
          </p>
        </motion.div>
      )}

      {reconnected && (
        <motion.div
          key="reconnected-alert"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            top: 'env(safe-area-inset-top, 0px)',
            left: 0,
            right: 0,
            zIndex: 999,
            padding: '8px 16px',
            background: 'linear-gradient(135deg, rgba(10, 30, 20, 0.96), rgba(15, 45, 25, 0.96))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 600,
              color: '#A7F3D0',
              fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
            }}
          >
            Conexão com a internet restabelecida.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
