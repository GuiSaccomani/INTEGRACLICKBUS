import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWA_DISMISSED_KEY = 'integra_pwa_install_dismissed';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Detectar modo standalone (instalado)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const standalone = isStandaloneMedia || isIOSStandalone;
      setIsStandalone(standalone);
      return standalone;
    };

    const standalone = checkStandalone();

    // 2. Detectar se foi dispensado pelo usuário nesta sessão/dispositivo
    const dismissed = localStorage.getItem(PWA_DISMISSED_KEY) === 'true';
    setIsDismissed(dismissed);

    // 3. Detectar iOS/iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Se já estiver em standalone, não precisa oferecer instalação
    if (standalone) {
      setCanInstall(false);
      return;
    }

    // 4. Capturar evento REAL do navegador: beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne a barra mini-infobar padrão do Chrome em Android
      e.preventDefault();
      // Armazena o evento real para disparo posterior sob demanda do usuário
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed) {
        setCanInstall(true);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
      setIsStandalone(true);
      localStorage.removeItem(PWA_DISMISSED_KEY);
      console.log('[PWA] ÍNTEGRA instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Monitorar alterações de display-mode
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      if (e.matches) {
        setCanInstall(false);
      }
    };
    mediaQueryList.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQueryList.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  // Instalação real utilizando a API nativa
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('[PWA] Prompt de instalação não disponível no navegador atual.');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setCanInstall(false);

      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Usuário aceitou a instalação.');
        return true;
      } else {
        console.log('[PWA] Usuário recusou a instalação.');
        return false;
      }
    } catch (err) {
      console.error('[PWA] Erro ao invocar prompt de instalação:', err);
      return false;
    }
  }, [deferredPrompt]);

  // Dispensar o banner
  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
    setCanInstall(false);
    localStorage.setItem(PWA_DISMISSED_KEY, 'true');
  }, []);

  return {
    canInstall: canInstall && !isStandalone && !isDismissed,
    isStandalone,
    isIOS,
    isDismissed,
    installApp,
    dismissBanner,
  };
}
