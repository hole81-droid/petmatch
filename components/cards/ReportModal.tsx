"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const REASONS = [
  "불쾌한 언행",
  "허위 정보 기재",
  "스팸·광고",
  "부적절한 사진",
  "기타",
];

interface Props {
  reportedUserId: string;
  petName: string;
  onClose: () => void;
  onBlock?: () => void;
}

export function ReportModal({ reportedUserId, petName, onClose, onBlock }: Props) {
  const [reason, setReason]   = useState("");
  const [saving, setSaving]   = useState(false);
  const [done, setDone]       = useState(false);

  async function handleReport() {
    if (!reason) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: reportedUserId,
      reason,
    });
    setSaving(false);
    setDone(true);
  }

  async function handleBlock() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: reportedUserId,
      reason: "BLOCK",
    });
    setSaving(false);
    onBlock?.();
    onClose();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(43,29,24,0.5)", display: "flex", alignItems: "flex-end" }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "#fff7ed", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#2b1d18", marginBottom: 6 }}>신고가 접수됐어요</div>
            <div style={{ fontSize: 13, color: "#8c7568", marginBottom: 20 }}>검토 후 조치할게요</div>
            <button onClick={onClose} style={{ padding: "10px 28px", borderRadius: 14, background: "var(--coral)", color: "#fff", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer" }}>닫기</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#2b1d18", marginBottom: 4 }}>{petName} 신고하기</div>
            <div style={{ fontSize: 12, color: "#8c7568", marginBottom: 16 }}>신고 사유를 선택해주세요</div>

            {REASONS.map((r) => (
              <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
                <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: "var(--coral)" }} />
                <span style={{ fontSize: 14, color: "#2b1d18" }}>{r}</span>
              </label>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={handleBlock}
                disabled={saving}
                style={{ flex: 1, padding: "12px", borderRadius: 14, background: "#e7b98a40", color: "#4a3128", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
              >
                🚫 차단
              </button>
              <button
                onClick={handleReport}
                disabled={!reason || saving}
                style={{ flex: 2, padding: "12px", borderRadius: 14, background: reason ? "var(--coral)" : "#e7b98a60", color: reason ? "#fff" : "#8c7568", fontWeight: 800, fontSize: 13, border: "none", cursor: reason ? "pointer" : "not-allowed" }}
              >
                {saving ? "처리 중..." : "신고 접수"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
