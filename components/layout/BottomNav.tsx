"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/discovery", label: "탐색",    icon: "🐾" },
  { href: "/matches",   label: "매칭",    icon: "💬" },
  { href: "/profile",   label: "프로필",  icon: "🐶" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "sticky", bottom: 0,
        background: "rgba(255,247,237,0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1.5px solid var(--line)",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "10px 0 8px",
              textDecoration: "none",
              color: active ? "var(--coral)" : "var(--pm-muted)",
              fontWeight: active ? 800 : 500,
              fontSize: 11,
              gap: 2,
            }}
          >
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
