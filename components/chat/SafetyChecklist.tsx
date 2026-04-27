"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  "예방접종·건강 상태를 상대방과 확인했어요",
  "만날 장소가 반려동물 동반 가능한 곳인지 확인했어요",
  "서로의 강아지/고양이 친화도를 공유했어요",
  "중성화·입마개 여부를 공유했어요",
];

interface Props {
  matchId: string;
  onComplete: () => void;
}

export function SafetyChecklist({ matchId, onComplete }: Props) {
  const [checked, setChecked] = useState<boolean[]>(Array(ITEMS.length).fill(false));
  const [saving, setSaving]   = useState(false);

  const allDone = checked.every(Boolean);

  async function handleComplete() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("matches").update({ safety_check_done: true }).eq("id", matchId);
    setSaving(false);
    onComplete();
  }

  return (
    <div style={{ margin: "12px 16px", borderRadius: 18, background: "#fff", border: "1.5px solid #e7b98a", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🛡️</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#2b1d18" }}>첫 만남 안전 체크리스트</div>
          <div style={{ fontSize: 11, color: "#8c7568" }}>모두 확인해야 약속 잡기가 활성화돼요</div>
        </div>
      </div>
      {ITEMS.map((item, i) => (
        <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={() => setChecked((prev) => prev.map((v, j) => j === i ? !v : v))}
            style={{ marginTop: 2, accentColor: "var(--coral)", width: 16, height: 16, flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, color: checked[i] ? "#8c7568" : "#2b1d18", textDecoration: checked[i] ? "line-through" : "none", lineHeight: 1.4 }}>
            {item}
          </span>
        </label>
      ))}
      <button
        disabled={!allDone || saving}
        onClick={handleComplete}
        style={{
          width: "100%", marginTop: 4, padding: "10px", borderRadius: 12,
          background: allDone ? "var(--coral)" : "#e7b98a60",
          color: allDone ? "#fff" : "#8c7568",
          fontWeight: 800, fontSize: 13, border: "none",
          cursor: allDone ? "pointer" : "not-allowed",
          transition: "all 0.2s",
        }}
      >
        {saving ? "저장 중..." : "✓ 확인 완료 — 약속 잡기 활성화"}
      </button>
    </div>
  );
}
