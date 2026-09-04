
  import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { registerSW } from "virtual:pwa-register";

// Registro automático do Service Worker do PWA
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("[PWA] Nova versão do ÍNTEGRA disponível.");
  },
  onOfflineReady() {
    console.log("[PWA] Recursos estáticos cacheados. ÍNTEGRA pronto para operar offline.");
  },
  onRegisterError(error) {
    console.error("[PWA] Falha ao registrar o Service Worker:", error);
  },
});

createRoot(document.getElementById("root")!).render(<App />);

  