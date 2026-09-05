import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { playClickSound, playToggleSound, playValidationSuccessSound, triggerHaptic, speakText } from "../../services/sound";

export interface A11ySettings {
  textSize: "normal" | "large" | "xl";
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  soundFeedback: boolean;
  vibrationFeedback: boolean;
  voiceFeedback: boolean;
  theme: "light" | "dark" | "system";
  darkMode: boolean;
}

interface A11yContextValue extends A11ySettings {
  update: (patch: Partial<A11ySettings>) => void;
  triggerFeedback: (type?: "success" | "error" | "neutral", textToRead?: string) => void;
  announce: (text: string) => void;
}

const defaults: A11ySettings = {
  textSize: "normal",
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  soundFeedback: true,
  vibrationFeedback: true,
  voiceFeedback: false,
  theme: "dark", // tema padrão elegante do ÍNTEGRA
  darkMode: true,
};

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function loadSettings(): A11ySettings {
  try {
    const saved = localStorage.getItem("a11y");
    if (saved) {
      const parsed = JSON.parse(saved);
      const isSystem = parsed.theme === "system";
      const isDark = parsed.theme === "dark" || (isSystem && getSystemPrefersDark()) || parsed.darkMode === true;
      return { ...defaults, ...parsed, darkMode: isDark };
    }
  } catch { /* ignore */ }

  return {
    ...defaults,
    darkMode: defaults.theme === "system" ? getSystemPrefersDark() : defaults.theme === "dark",
  };
}

const A11yContext = createContext<A11yContextValue>({
  ...defaults,
  update: () => {},
  triggerFeedback: () => {},
  announce: () => {},
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(loadSettings);

  const announce = (text: string) => {
    if (settings.voiceFeedback || settings.screenReader) {
      speakText(text);
    }
  };

  const triggerFeedback = (type: "success" | "error" | "neutral" = "neutral", textToRead?: string) => {
    if (settings.vibrationFeedback) {
      if (type === "success") triggerHaptic([80, 40, 100]);
      else if (type === "error") triggerHaptic([200, 80, 200]);
      else triggerHaptic(40);
    }

    if (settings.soundFeedback) {
      if (type === "success") playValidationSuccessSound();
      else if (type === "error") playToggleSound(false);
      else playClickSound();
    }

    if (textToRead && (settings.voiceFeedback || settings.screenReader)) {
      speakText(textToRead);
    }
  };

  const update = (patch: Partial<A11ySettings>) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };

      if (patch.theme) {
        if (patch.theme === "system") {
          next.darkMode = getSystemPrefersDark();
        } else {
          next.darkMode = patch.theme === "dark";
        }
      }

      // Feedback imediato da alteração
      if (patch.soundFeedback !== undefined) {
        playToggleSound(patch.soundFeedback);
      } else if (patch.vibrationFeedback !== undefined && patch.vibrationFeedback) {
        triggerHaptic([60, 40, 60]);
      } else if (patch.voiceFeedback !== undefined) {
        if (patch.voiceFeedback) speakText("Leitura de voz ativada");
      } else if (patch.highContrast !== undefined) {
        if (next.soundFeedback) playToggleSound(patch.highContrast);
        if (next.voiceFeedback) speakText(patch.highContrast ? "Alto contraste ativado" : "Alto contraste desativado");
      } else if (patch.textSize) {
        const labels: Record<string, string> = { normal: "Tamanho normal", large: "Texto grande", xl: "Texto extra grande" };
        if (next.voiceFeedback) speakText(labels[patch.textSize] || "Tamanho alterado");
      } else if (patch.theme) {
        const themeLabels: Record<string, string> = { light: "Tema claro ativado", dark: "Tema escuro ativado", system: "Tema do sistema ativado" };
        if (next.voiceFeedback) speakText(themeLabels[patch.theme] || "Tema alterado");
      }

      localStorage.setItem("a11y", JSON.stringify(next));
      return next;
    });

  // Escuta alteração de preferência de cor do sistema operacional
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (settings.theme === "system") {
        setSettings((prev) => ({ ...prev, darkMode: e.matches }));
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings.theme]);

  // Aplicação efetiva de todas as classes, estilos e meta-tags no DOM
  useEffect(() => {
    const root = document.documentElement;
    const scale = settings.textSize === "normal" ? 1 : settings.textSize === "large" ? 1.15 : 1.3;

    root.style.setProperty("--a11y-scale", String(scale));
    root.classList.toggle("dark", settings.darkMode);
    root.classList.toggle("theme-dark", settings.darkMode);
    root.classList.toggle("theme-light", !settings.darkMode);
    root.classList.toggle("hc", settings.highContrast);
    root.classList.toggle("reduce-motion", settings.reduceMotion);
    root.classList.toggle("screen-reader-active", settings.screenReader);
    root.classList.toggle("a11y-text-large", settings.textSize === "large");
    root.classList.toggle("a11y-text-xl", settings.textSize === "xl");

    // Atualiza cor da barra do sistema operacional móvel
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", settings.darkMode ? "#110826" : "#F9FAFB");
    }
  }, [
    settings.darkMode,
    settings.textSize,
    settings.highContrast,
    settings.reduceMotion,
    settings.screenReader,
  ]);

  return (
    <A11yContext.Provider value={{ ...settings, update, triggerFeedback, announce }}>
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y() {
  return useContext(A11yContext);
}
