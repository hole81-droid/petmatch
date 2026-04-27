"use client";

import type { CSSProperties, ReactNode } from "react";

type Variant = "pass" | "like" | "primary" | "neutral" | "super";

interface Props {
  variant?: Variant;
  size?: number; // px diameter
  onClick?: () => void;
  children: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

const STYLE: Record<Variant, { color: string; bg: string; border?: string; shadow: string }> = {
  pass:    { color: "#de5757",          bg: "#fff", border: "#ff9a91", shadow: "0 8px 22px rgba(222,87,87,0.22)" },
  like:    { color: "var(--matcha-dark)", bg: "#fff", border: "var(--matcha)", shadow: "0 8px 22px rgba(79,155,111,0.25)" },
  primary: { color: "#fff", bg: "linear-gradient(145deg, var(--coral), #ff936a)", shadow: "0 14px 30px rgba(244,111,117,0.35)" },
  neutral: { color: "var(--brown)", bg: "#fff", border: "var(--line)", shadow: "0 8px 22px rgba(74,49,40,0.10)" },
  super:   { color: "#fff", bg: "linear-gradient(145deg, #5fc1ff, #4f9bff)", shadow: "0 14px 30px rgba(79,155,255,0.35)" },
};

export function ActionButton({
  variant = "primary",
  size = 56,
  onClick,
  children,
  ariaLabel,
  disabled,
}: Props) {
  const s = STYLE[variant];
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: s.bg,
    color: s.color,
    border: s.border ? `2px solid ${s.border}` : "none",
    boxShadow: s.shadow,
    fontSize: Math.round(size * 0.36),
    fontWeight: 950,
    display: "grid",
    placeItems: "center",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "transform 0.12s",
  };
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      style={style}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.92)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}
