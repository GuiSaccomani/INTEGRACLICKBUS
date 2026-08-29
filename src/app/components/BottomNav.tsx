import { useNavigate, useLocation } from "react-router";
import { useDS } from "./MobileLayout";

export type NavTab = "home" | "viagens" | "bagagens" | "conta";

interface NavItem { id: NavTab; label: string; path: string; }

function getActiveTab(pathname: string): NavTab {
  if (pathname === "/home") return "home";
  if (pathname === "/passagem" || pathname === "/historico" || pathname === "/nfc" || pathname === "/validada") return "viagens";
  if (pathname.startsWith("/bagagem") || pathname.startsWith("/bagagens")) return "bagagens";
  if (pathname === "/conta") return "conta";
  return "home";
}

const NAV_ITEMS: NavItem[] = [
  { id: "home",     label: "Início",   path: "/home" },
  { id: "viagens",  label: "Viagens",  path: "/passagem" },
  { id: "bagagens", label: "Bagagens", path: "/bagagens" },
  { id: "conta",    label: "Conta",    path: "/conta" },
];

function NavIcon({ id, active }: { id: NavTab; active: boolean }) {
  const DS = useDS();
  const c = active ? DS.primary : DS.text3;
  const w = active ? "2.2" : "1.8";
  if (id === "home") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3l9 9v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9z" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21V12h6v9" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (id === "viagens") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="3" stroke={c} strokeWidth={w} />
      <path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <line x1="12" y1="11" x2="12" y2="17" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9" y1="14" x2="15" y2="14" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
  if (id === "bagagens") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="8" width="14" height="11" rx="2" stroke={c} strokeWidth={w} />
      <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <line x1="5" y1="13" x2="19" y2="13" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth={w} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
}

export function BottomNav() {
  const DS = useDS();
  const nav = useNavigate();
  const location = useLocation();
  const active = getActiveTab(location.pathname);

  return (
    <div style={{
      display: "flex",
      background: DS.surface,
      borderTop: `1px solid ${DS.border}`,
      paddingBottom: 18,
      flexShrink: 0,
      zIndex: 10,
    }}>
      {NAV_ITEMS.map(item => {
        const on = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => { if (location.pathname !== item.path) nav(item.path); }}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              padding: "11px 0 0", fontFamily: "'Inter', sans-serif",
            }}
          >
            <NavIcon id={item.id} active={on} />
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500, color: on ? DS.primary : DS.text3 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
