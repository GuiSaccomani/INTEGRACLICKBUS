import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// No Tauri 2, os recursos estáticos são embutidos e servidos nativamente pelo WebView,
// dispensando o Service Worker de PWA.
console.log("[Tauri 2 POC] ÍNTEGRA inicializado em ambiente nativo mobile.");

createRoot(document.getElementById("root")!).render(<App />);