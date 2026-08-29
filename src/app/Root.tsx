import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { BottomNav } from "./components/BottomNav";
import { useA11y } from "./components/AccessibilityContext";
import { useDS } from "./components/MobileLayout";

const BOTTOM_NAV_ROUTES = new Set(["/home", "/passagem", "/bagagens", "/historico", "/conta"]);

export function Root() {
  const location = useLocation();
  const showNav = BOTTOM_NAV_ROUTES.has(location.pathname);
  const { darkMode } = useA11y();
  const DS = useDS();
  const statusColor = darkMode ? "#F1F5F9" : "#111827";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 28% 18%, #1f0748 0%, #130333 45%, #0c0c18 100%)",
      padding: "20px",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Ambient glows */}
      <div style={{ position: "fixed", top: "5%", left: "8%", width: 360, height: 360, borderRadius: "50%", background: "rgba(123,44,191,0.07)", filter: "blur(90px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "10%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "rgba(157,78,221,0.05)", filter: "blur(70px)", pointerEvents: "none" }} />

      {/* iPhone 15 Pro frame */}
      <div style={{ width: 390, height: 844, position: "relative", flexShrink: 0 }}>
        {/* Outer glow */}
        <div style={{ position: "absolute", inset: -3, borderRadius: 56, boxShadow: "0 50px 150px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07)" }} />
        {/* Titanium body */}
        <div style={{ position: "absolute", inset: -12, borderRadius: 58, background: "linear-gradient(160deg, #4A4A4C 0%, #222224 55%, #3A3A3C 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.5)" }} />
        {/* Side buttons */}
        <div style={{ position: "absolute", left: -16, top: 126, width: 4, height: 30, background: "#3C3C3E", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -16, top: 174, width: 4, height: 58, background: "#3C3C3E", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -16, top: 246, width: 4, height: 58, background: "#3C3C3E", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", right: -16, top: 182, width: 4, height: 74, background: "#3C3C3E", borderRadius: "0 2px 2px 0" }} />

        {/* Screen glass */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 46, overflow: "hidden", background: DS.bg, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)", display: "flex", flexDirection: "column", transition: "background 0.3s" }}>
          {/* Dynamic Island */}
          <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 118, height: 34, background: "#000", borderRadius: 20, zIndex: 200 }} />
          {/* Status bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 50, zIndex: 150, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 28px 6px", pointerEvents: "none" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: statusColor, fontFamily: "system-ui", letterSpacing: "-0.3px" }}>9:41</span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <svg width="17" height="12" viewBox="0 0 17 12">
                {[0, 4.3, 8.6, 12.9].map((x, i) => (
                  <rect key={x} x={x} y={12 - (i + 1) * 3} width="3" height={(i + 1) * 3} rx="0.7" fill={statusColor} />
                ))}
              </svg>
              <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                <path d="M7.5 8.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill={statusColor} />
                <path d="M4.5 6.2a4 4 0 0 1 6 0" stroke={statusColor} strokeWidth="1.2" strokeLinecap="round" />
                <path d="M1.5 3.5a8 8 0 0 1 12 0" stroke={statusColor} strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                <div style={{ width: 24, height: 12, border: `1.5px solid ${statusColor}`, borderRadius: 3.5, padding: "1.5px 2px", display: "flex", alignItems: "center" }}>
                  <div style={{ width: "78%", height: "100%", background: statusColor, borderRadius: 1.5 }} />
                </div>
                <div style={{ width: 1.5, height: 5, background: statusColor, borderRadius: "0 1px 1px 0" }} />
              </div>
            </div>
          </div>

          {/* App content */}
          <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16, transition: { duration: 0.18 } }}
                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ position: "absolute", inset: 0 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Persistent BottomNav — outside AnimatePresence so it never re-mounts */}
          {showNav && <BottomNav />}
        </div>
      </div>
    </div>
  );
}
