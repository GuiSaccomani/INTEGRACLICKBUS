import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useA11y } from "./AccessibilityContext";
import { speakText, triggerHaptic } from "../../services/sound";

const ROUTE_ANNOUNCEMENTS: Record<string, string> = {
  "/": "Tela de boas-vindas do ÍNTEGRA.",
  "/login": "Tela de acesso. Digite suas credenciais para entrar.",
  "/home": "Tela Início. Próxima viagem pronta para embarque.",
  "/passagem": "Tela Minha Passagem. Apresente o QR Code ou aproxime por NFC.",
  "/qrcode": "Tela QR Code de Embarque em tela cheia. Apresente ao motorista.",
  "/validada": "Tela Passagem Aprovada! Embarque liberado e salvo no sistema.",
  "/bagagens": "Tela Minhas Bagagens. Rastreabilidade de volumes despachados.",
  "/bagagem-nova": "Tela de registro de nova bagagem.",
  "/conta": "Tela Minha Conta e preferências de acessibilidade.",
  "/motorista/home": "Tela Principal do Motorista. Escala e viagem atual.",
  "/motorista/validacao": "Tela de Validação de Passageiros. Leitor de QR Code e NFC.",
  "/motorista/bagagem": "Tela de Adicionar Bagagem pelo motorista.",
  "/motorista/desembarque": "Tela de Desembarque de Bagagens.",
  "/motorista/passageiros": "Lista de passageiros da viagem.",
  "/notificacoes": "Central de notificações da viagem.",
  "/ajuda": "Central de suporte e ajuda.",
};

export function ScreenReaderAnnouncer() {
  const { screenReader, update } = useA11y();
  const location = useLocation();
  const [lastSpoken, setLastSpoken] = useState<string>("");
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Anuncia mudanças de tela automaticamente
  useEffect(() => {
    if (!screenReader) return;

    const announcement =
      ROUTE_ANNOUNCEMENTS[location.pathname] ||
      `Navegou para a página ${location.pathname.replace("/", "")}.`;

    setLastSpoken(announcement);
    speakText(announcement);
    setHighlightRect(null);
  }, [location.pathname, screenReader]);

  // Listener global para ler elementos ao tocar ou focar
  useEffect(() => {
    if (!screenReader) {
      setHighlightRect(null);
      return;
    }

    const handleInteraction = (event: MouseEvent | TouchEvent | FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Encontra elemento interativo ou semântico mais próximo
      const interactiveEl = target.closest<HTMLElement>(
        'button, a, input, [role="button"], [role="switch"], h1, h2, h3, p, [tabindex]'
      ) || target;

      if (!interactiveEl) return;

      // Determina papel e conteúdo acessível
      const role = interactiveEl.getAttribute("role");
      const ariaLabel = interactiveEl.getAttribute("aria-label");
      const tagName = interactiveEl.tagName.toLowerCase();
      const rawText = ariaLabel || interactiveEl.innerText || interactiveEl.textContent || "";
      const text = rawText.trim().replace(/\s+/g, " ");

      if (!text && tagName !== "input") return;

      let description = "";

      if (role === "switch" || interactiveEl.getAttribute("aria-checked") !== null) {
        const isChecked = interactiveEl.getAttribute("aria-checked") === "true";
        description = `Interruptor ${text}: ${isChecked ? "ativado" : "desativado"}. Toque para alternar.`;
      } else if (tagName === "button" || role === "button") {
        description = `Botão: ${text}. Toque para acionar.`;
      } else if (tagName === "a") {
        description = `Link: ${text}.`;
      } else if (tagName === "input") {
        const input = interactiveEl as HTMLInputElement;
        description = `Campo de entrada: ${input.placeholder || "Texto"}. ${input.value ? `Valor atual: ${input.value}` : "Vazio"}.`;
      } else if (["h1", "h2", "h3"].includes(tagName)) {
        description = `Título: ${text}.`;
      } else {
        description = text;
      }

      // Evita repetição instantânea idêntica em cliques seguidos
      setLastSpoken(description);
      speakText(description);
      triggerHaptic(30);

      // Marca visualmente a caixa do leitor de tela
      const rect = interactiveEl.getBoundingClientRect();
      setHighlightRect(rect);
    };

    window.addEventListener("click", handleInteraction, { capture: true });
    window.addEventListener("focusin", handleInteraction, { capture: true });

    return () => {
      window.removeEventListener("click", handleInteraction, { capture: true });
      window.removeEventListener("focusin", handleInteraction, { capture: true });
    };
  }, [screenReader]);

  if (!screenReader) return null;

  return (
    <>
      {/* Moldura de seleção do leitor de tela (estilo TalkBack/VoiceOver) */}
      {highlightRect && (
        <div
          style={{
            position: "fixed",
            left: highlightRect.left - 2,
            top: highlightRect.top - 2,
            width: highlightRect.width + 4,
            height: highlightRect.height + 4,
            border: "2.5px solid #10B981",
            borderRadius: 8,
            pointerEvents: "none",
            zIndex: 9999,
            boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)",
            transition: "all 0.12s ease-out",
          }}
        />
      )}

      {/* Faixa superior informativa do leitor de tela em execução */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 250,
          background: "linear-gradient(180deg, rgba(16,185,129,0.95) 0%, rgba(5,150,105,0.95) 100%)",
          color: "#FFFFFF",
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          fontWeight: 700,
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          letterSpacing: "0.3px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, overflow: "hidden" }}>
          <span style={{ fontSize: 13 }}>🔊</span>
          <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
            {lastSpoken || "Leitor de tela ativo · Toque em qualquer elemento"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => update({ screenReader: false })}
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "none",
            borderRadius: 6,
            color: "#FFF",
            padding: "2px 8px",
            fontSize: 10,
            fontWeight: 800,
            cursor: "pointer",
            marginLeft: 8,
            flexShrink: 0,
          }}
        >
          Desativar
        </button>
      </div>
    </>
  );
}
