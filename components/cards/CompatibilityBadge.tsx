"use client";

interface Props {
  score: number;
  size?: "sm" | "md";
}

export function CompatibilityBadge({ score, size = "md" }: Props) {
  let bg: string;
  let label: string;
  if (score >= 80) { bg = "#a8d8b9"; label = "잘 맞아요"; }
  else if (score >= 60) { bg = "#f4c06f"; label = "괜찮아요"; }
  else { bg = "#c4b5ad"; label = "조금 달라요"; }

  const px = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${px}`}
      style={{ background: bg, color: "#2b1d18" }}
    >
      <span>{score}점</span>
      {size === "md" && <span className="opacity-70">· {label}</span>}
    </span>
  );
}
