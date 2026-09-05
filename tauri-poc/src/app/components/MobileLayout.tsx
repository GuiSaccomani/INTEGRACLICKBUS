// @refresh reset
import React from "react";
import { useA11y } from "./AccessibilityContext";

/* ═══════════════════════════════════════════════
   ÍNTEGRA — Design System v3
   Minimalista · Premium · Acessível
════════════════════════════════════════════════ */

export const DS = {
  primary:      "#7B2CBF",
  primaryDark:  "#5B1A9F",
  primaryLight: "#F5F0FF",
  primaryMid:   "#DDD6FE",
  secondary:    "#9D4EDD",

  bg:      "#F9FAFB",
  surface: "#FFFFFF",

  text1: "#111827",
  text2: "#6B7280",
  text3: "#9CA3AF",

  border:   "#F3F4F6",
  borderMd: "#E5E7EB",

  success:      "#059669",
  successLight: "#ECFDF5",
  successMid:   "#6EE7B7",

  warning:      "#D97706",
  warningLight: "#FFF7ED",

  error:      "#DC2626",
  errorLight: "#FEF2F2",

  shadowXs:      "0 1px 2px rgba(0,0,0,0.05)",
  shadowSm:      "0 1px 8px rgba(0,0,0,0.06)",
  shadowMd:      "0 4px 20px rgba(0,0,0,0.08)",
  shadowPrimary: "0 4px 20px rgba(123,44,191,0.22)",
};

export const DS_DARK = {
  primary:      "#7B2CBF",
  primaryDark:  "#5B1A9F",
  primaryLight: "#1E1033",
  primaryMid:   "#3D1A6E",
  secondary:    "#A855F7",

  bg:      "#0D0D1A",
  surface: "#13131F",

  text1: "#F1F5F9",
  text2: "#94A3B8",
  text3: "#6B7280",

  border:   "#1E1E2E",
  borderMd: "#2A2A3E",

  success:      "#10B981",
  successLight: "#042B1A",
  successMid:   "#065F46",

  warning:      "#F59E0B",
  warningLight: "#1C1008",

  error:      "#EF4444",
  errorLight: "#1C0808",

  shadowXs:      "0 1px 2px rgba(0,0,0,0.4)",
  shadowSm:      "0 1px 8px rgba(0,0,0,0.5)",
  shadowMd:      "0 4px 20px rgba(0,0,0,0.6)",
  shadowPrimary: "0 4px 20px rgba(123,44,191,0.4)",
};

export type DSType = typeof DS;

import { useOperator } from "./OperatorContext";

export function useDS(): DSType {
  const { darkMode, highContrast } = useA11y();
  const { operator } = useOperator();
  
  let baseDS = darkMode ? DS_DARK : DS;

  if (highContrast) {
    baseDS = darkMode
      ? {
          ...baseDS,
          bg: "#000000",
          surface: "#090910",
          text1: "#FFFFFF",
          text2: "#E2E8F0",
          text3: "#CBD5E1",
          border: "#475569",
          borderMd: "#64748B",
        }
      : {
          ...baseDS,
          bg: "#FFFFFF",
          surface: "#F8FAFC",
          text1: "#000000",
          text2: "#0F172A",
          text3: "#334155",
          border: "#000000",
          borderMd: "#000000",
        };
  }
  
  // Overriding primary colors dynamically based on Operator
  return {
    ...baseDS,
    primary: operator.primaryColor || baseDS.primary,
    primaryDark: operator.primaryDarkColor || baseDS.primaryDark,
  };
}

export function LogoMark({ size = 40, bg }: { size?: number; bg?: string }) {
  const ds = useDS();
  const bgColor = bg ?? ds.primary;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.26,
      background: bgColor,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      padding: Math.max(3, Math.round(size * 0.08)),
      boxShadow: ds.shadowPrimary,
    }}>
      <img
        src="/logo-in.png"
        alt="ÍNTEGRA Logo"
        style={{ width: "90%", height: "90%", objectFit: "contain" }}
      />
    </div>
  );
}

export const Fonts = {
  body: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  heading: "'Space Grotesk', -apple-system, sans-serif",
};

export function OperatorHeader() {
  const { operator } = useOperator();
  const ds = useDS();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", background: ds.bg }}>
      {operator.logoUrl ? (
        <img src={operator.logoUrl} alt={operator.name} style={{ height: 12, opacity: 0.6 }} />
      ) : (
        <span style={{ fontSize: 10, fontWeight: 700, color: ds.text3, fontFamily: Fonts.heading, letterSpacing: "0.5px", textTransform: "uppercase" }}>
          Operado por {operator.name}
        </span>
      )}
    </div>
  );
}

export function Screen({ children, bg, style }: {
  children: React.ReactNode; bg?: string; style?: React.CSSProperties;
}) {
  const ds = useDS();
  const { textSize } = useA11y();
  return (
    <div
      className={`screen-container a11y-text-${textSize}`}
      style={{
        position: "absolute", inset: 0,
        background: bg ?? ds.bg,
        display: "flex", flexDirection: "column",
        fontFamily: Fonts.body,
        overflow: "hidden",
        ...style,
      }}
    >
      <OperatorHeader />
      {children}
    </div>
  );
}

export function ScrollBody({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { textSize } = useA11y();
  const zoomScale = textSize === "large" ? 1.18 : textSize === "xl" ? 1.36 : 1.0;
  return (
    <div
      className="screen-scroll-body"
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch" as const,
        zoom: zoomScale,
        ...style,
      }}
    >
      {children}
    </div>
  );
}


export function BackHeader({ title, onBack, right }: {
  title?: string; onBack: () => void; right?: React.ReactNode;
}) {
  const ds = useDS();
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "52px 20px 14px",
      background: ds.surface,
      borderBottom: `1px solid ${ds.border}`,
      flexShrink: 0,
    }}>
      <button onClick={onBack} style={{
        width: 40, height: 40, borderRadius: 12,
        border: `1.5px solid ${ds.borderMd}`,
        background: ds.surface,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke={ds.text1} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 700, color: ds.text1, fontFamily: Fonts.heading }}>{title}</span>
      <div style={{ width: 40, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

export function BtnPrimary({ label, onClick, disabled, icon, fitContent }: {
  label: string; onClick?: () => void; disabled?: boolean; icon?: React.ReactNode; fitContent?: boolean;
}) {
  const ds = useDS();
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: fitContent ? "fit-content" : "100%", 
      padding: fitContent ? "0 24px" : "0",
      height: 64, borderRadius: 100, border: "none",
      background: disabled ? ds.primaryMid : `linear-gradient(135deg, ${ds.primaryDark}, ${ds.primary})`,
      color: "#fff", fontSize: 17, fontWeight: 600, letterSpacing: "-0.2px",
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: Fonts.body,
      boxShadow: disabled ? "none" : ds.shadowPrimary,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      transition: "opacity 0.12s, transform 0.1s",
    }}
      onPointerDown={e => { if (!disabled) { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(0.975)"; } }}
      onPointerUp={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      {icon}{label}
    </button>
  );
}

export function BtnGhost({ label, onClick, icon, fitContent }: { label: string; onClick?: () => void; icon?: React.ReactNode; fitContent?: boolean; }) {
  const ds = useDS();
  return (
    <button onClick={onClick} style={{
      width: fitContent ? "fit-content" : "100%",
      padding: fitContent ? "0 24px" : "0", 
      height: 56, borderRadius: 100,
      border: `1.5px solid ${ds.borderMd}`,
      background: "transparent", color: ds.text1,
      fontSize: 16, fontWeight: 600,
      cursor: "pointer", fontFamily: Fonts.body,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      {icon}{label}
    </button>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const ds = useDS();
  return (
    <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: ds.text3, letterSpacing: "0.7px", textTransform: "uppercase" as const, fontFamily: Fonts.body }}>
      {children}
    </p>
  );
}

type BadgeKind = "success" | "warning" | "primary" | "neutral" | "error";
export function StatusBadge({ label, kind = "neutral" }: { label: string; kind?: BadgeKind }) {
  const ds = useDS();
  const map: Record<BadgeKind, [string, string]> = {
    success: [ds.successLight, ds.success],
    warning: [ds.warningLight, ds.warning],
    primary: [ds.primaryLight, ds.primary],
    neutral: [ds.border, ds.text2],
    error:   [ds.errorLight, ds.error],
  };
  const [_, color] = map[kind];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "transparent", color, borderRadius: 100, padding: "4px 8px",
      border: `1px solid ${color}`,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.2px", whiteSpace: "nowrap" as const,
    }}>
      {label}
    </span>
  );
}
