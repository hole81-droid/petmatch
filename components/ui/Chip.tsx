"use client";

import type { CSSProperties, ReactNode } from "react";

type ChipVariant = "coral" | "matcha" | "latte" | "ghost" | "dark";

interface Props {
  children: ReactNode;
  variant?: ChipVariant;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: CSSProperties;
  size?: "sm" | "md";
}

const PALETTE: Record<ChipVariant, { bg: string; fg: string; border?: string }> = {
  coral:  { bg: "var(--coral)",      fg: "#fff" },
  matcha: { bg: "var(--matcha)",     fg: "var(--brown)" },
  latte:  { bg: "var(--latte-soft)", fg: "var(--brown)" },
  ghost:  { bg: "rgba(255,255,255,0.18)", fg: "#fff", border: "rgba(255,255,255,0.0)" },
  dark:   { bg: "rgba(43,29,24,0.06)", fg: "var(--brown)" },
};

export function Chip({ children, variant = "latte", active, onClick, style, size = "md" }: Props) {
  const p = active ? PALETTE.coral : PALETTE[variant];
  const pad = size === "sm" ? "5px 10px" : "8px 12px";
  const fs  = size === "sm" ? 11 : 12;
  const isInteractive = !!onClick;

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: pad,
    borderRadius: 999,
    background: p.bg,
    color: p.fg,
    fontSize: fs,
    fontWeight: 850,
    lineHeight: 1.2,
    border: "none",
    cursor: isInteractive ? "pointer" : "default",
    backdropFilter: variant === "ghost" ? "blur(10px)" : undefined,
    transition: "transform 0.1s",
    ...style,
  };

  if (isInteractive) {
    return (
      <button type="button" onClick={onClick} style={base}>
        {children}
      </button>
    );
  }
  return <span style={base}>{children}</span>;
}
