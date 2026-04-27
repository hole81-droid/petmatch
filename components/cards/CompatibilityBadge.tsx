"use client";

interface Props {
  score: number;
  size?: "sm" | "md";
}

// 디자인보드 ".score" pill: 흰 캡슐 + coral-dark 텍스트
// 점수에 따라 라벨 변화 (Cafe Match / Walk Match / OK Match)
export function CompatibilityBadge({ score, size = "md" }: Props) {
  let label: string;
  if (score >= 80) label = "Cafe Match";
  else if (score >= 60) label = "Walk Match";
  else label = "OK Match";

  const isSm = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: isSm ? "6px 10px" : "8px 12px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.92)",
        color: "var(--coral-dark)",
        fontSize: isSm ? 11 : 13,
        fontWeight: 950,
        letterSpacing: "0.01em",
        boxShadow: "0 6px 16px rgba(74,49,40,0.14)",
        backdropFilter: "blur(10px)",
      }}
    >
      {score}% {label}
    </span>
  );
}
