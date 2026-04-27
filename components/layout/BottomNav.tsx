"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/discovery", label: "탐색",   icon: "🐾" },
  { href: "/matches",   label: "매칭",   icon: "💬" },
  { href: "/profile",   label: "프로필", icon: "🐶" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      style={{
        padding: "8px 14px calc(8px + env(safe-area-inset-bottom, 0px))",
        background: "transparent",
      }}
    >
      <nav
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
          gap: 4,
          padding: 8,
          borderRadius: 24,
          background: "rgba(248,231,212,0.78)",
          border: "1px solid var(--line)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 12px 28px rgba(74,49,40,0.10)",
        }}
      >
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 0 6px",
                borderRadius: 18,
                textDecoration: "none",
                background: active ? "#fff" : "transparent",
                boxShadow: active ? "0 6px 14px rgba(74,49,40,0.12)" : "none",
                color: active ? "var(--coral)" : "var(--pm-muted)",
                fontWeight: active ? 950 : 750,
                fontSize: 11,
                transition: "all 0.18s",
              }}
            >
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
