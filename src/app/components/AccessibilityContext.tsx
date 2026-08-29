import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface A11ySettings {
  textSize: "normal" | "large" | "xl";
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  soundFeedback: boolean;
  vibrationFeedback: boolean;
  voiceFeedback: boolean;
  theme: "light" | "dark" | "system";
  darkMode: boolean; // maintained for compatibility, updated based on theme
}

interface A11yContextValue extends A11ySettings {
  update: (patch: Partial<A11ySettings>) => void;
  triggerFeedback: (type?: "success" | "error" | "neutral", textToRead?: string) => void;
}

const defaults: A11ySettings = {
  textSize: "normal",
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  soundFeedback: false,
  vibrationFeedback: true,
  voiceFeedback: false,
  theme: "system",
  darkMode: false,
};

function loadSettings(): A11ySettings {
  try {
    const saved = localStorage.getItem("a11y");
    if (saved) return { ...defaults, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return defaults;
}

const A11yContext = createContext<A11yContextValue>({
  ...defaults,
  update: () => {},
  triggerFeedback: () => {},
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(loadSettings);

  const update = (patch: Partial<A11ySettings>) =>
    setSettings(prev => {
      const next = { ...prev, ...patch };
      
      if (patch.theme) {
        if (patch.theme === "system") {
          next.darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        } else {
          next.darkMode = patch.theme === "dark";
        }
      }
      
      localStorage.setItem("a11y", JSON.stringify(next));
      return next;
    });

  useEffect(() => {
    // Escutar mudança de tema do sistema caso esteja no modo "system"
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (settings.theme === "system") {
        setSettings(prev => ({ ...prev, darkMode: e.matches }));
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    
    // Configuração inicial caso seja "system" mas esteja diferente do esperado na carga
    if (settings.theme === "system" && settings.darkMode !== mediaQuery.matches) {
       setSettings(prev => ({ ...prev, darkMode: mediaQuery.matches }));
    }

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings.theme, settings.darkMode]);

  useEffect(() => {
    const scale = settings.textSize === "normal" ? 1 : settings.textSize === "large" ? 1.1 : 1.25;
    document.documentElement.style.setProperty("--a11y-scale", String(scale));
    document.documentElement.classList.toggle("hc", settings.highContrast);
  }, [settings.textSize, settings.highContrast]);

  const triggerFeedback = (type: "success" | "error" | "neutral" = "neutral", textToRead?: string) => {
    if (settings.vibrationFeedback && "vibrate" in navigator) {
      if (type === "success") navigator.vibrate([100, 50, 100]);
      else if (type === "error") navigator.vibrate([300, 100, 300]);
      else navigator.vibrate(50);
    }
    
    if (settings.soundFeedback) {
       // A simple implementation of sound using Web Audio API could go here, or just HTML5 Audio
       // For brevity and lack of assets, we simulate or assume it's integrated via other means.
       // E.g., play a beep
       try {
         const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
         const osc = ctx.createOscillator();
         osc.type = "sine";
         osc.frequency.value = type === "success" ? 800 : type === "error" ? 300 : 500;
         osc.connect(ctx.destination);
         osc.start();
         osc.stop(ctx.currentTime + (type === "error" ? 0.3 : 0.1));
       } catch { /* ignore */ }
    }

    if (settings.voiceFeedback && textToRead && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "pt-BR";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <A11yContext.Provider value={{ ...settings, update, triggerFeedback }}>
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y() {
  return useContext(A11yContext);
}
