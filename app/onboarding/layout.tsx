"use client";

import { usePathname } from "next/navigation";

const STEPS = [
  { path: "/onboarding",           label: "내 정보" },
  { path: "/onboarding/pet",       label: "반려동물" },
  { path: "/onboarding/badges",    label: "성향" },
  { path: "/onboarding/purpose",   label: "목적" },
  { path: "/onboarding/lifestyle", label: "라이프스타일" },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => s.path === pathname);
  const step = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ background: "linear-gradient(135deg, var(--cream), #fffaf2 42%, #f7dec4)" }}
    >
      <div className="max-w-sm mx-auto">
        {/* 로고 */}
        <div className="text-center mb-6">
          <span className="text-2xl">🐾</span>
          <span className="ml-2 font-bold text-lg" style={{ color: "var(--ink)" }}>PetMatch</span>
        </div>

        {/* 진행 바 */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <span
                key={s.path}
                className="text-xs font-semibold"
                style={{ color: i <= step ? "var(--coral)" : "var(--pm-muted)" }}
              >
                {s.label}
              </span>
            ))}
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--latte-soft)" }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                background: "var(--coral)",
                width: `${((step + 1) / STEPS.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-right text-xs mt-1" style={{ color: "var(--pm-muted)" }}>
            {step + 1} / {STEPS.length}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
