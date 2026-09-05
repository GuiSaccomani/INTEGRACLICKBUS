import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { BottomNav } from "./components/BottomNav";
import { useDS } from "./components/MobileLayout";
import { OfflineNotice } from "./components/OfflineNotice";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { ScreenReaderAnnouncer } from "./components/ScreenReaderAnnouncer";

const BOTTOM_NAV_ROUTES = new Set([
  "/home", "/passagem", "/bagagens", "/historico", "/conta",
  "/motorista/home", "/motorista/historico", "/motorista/lista-bagagens", "/motorista/conta"
]);

export function Root() {
  const location = useLocation();
  const showNav = BOTTOM_NAV_ROUTES.has(location.pathname);
  const DS = useDS();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100dvh",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        background: DS.bg,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Container Responsivo Full Screen */}
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          minHeight: "100dvh",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: DS.bg,
          boxShadow: "0 0 40px rgba(0,0,0,0.06)",
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
          overflow: "hidden",
        }}
      >
        {/* Aviso discreto de desconexão offline */}
        <OfflineNotice />

        {/* Banner genuíno de instalação PWA quando suportado */}
        <PWAInstallBanner />

        {/* Leitor de tela funcional interativo com síntese de voz e foco visual */}
        <ScreenReaderAnnouncer />

        {/* App content com transição suave entre telas */}
        <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Persistent BottomNav */}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
