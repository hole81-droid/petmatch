"use client";

import type { Appointment } from "@/types/database";

interface Props {
  appt: Appointment;
  isMine: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  PENDING:   { text: "수락 대기 중", color: "#f4c06f" },
  CONFIRMED: { text: "✓ 약속 확정",  color: "#a8d8b9" },
  CANCELLED: { text: "취소됨",       color: "#c4b5ad" },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", { month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" });
}

export function AppointmentCard({ appt, isMine, onConfirm, onCancel }: Props) {
  const status = STATUS_LABEL[appt.status];

  return (
    <div style={{ margin: "8px 16px", borderRadius: 18, background: "#fff", border: "1.5px solid #e7b98a", padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18 }}>📅</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#2b1d18" }}>산책 약속</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: status.color, color: "#2b1d18" }}>
          {status.text}
        </span>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: "#2b1d18", marginBottom: 4 }}>
        🕐 {formatDateTime(appt.scheduled_at)}
      </div>
      <div style={{ fontSize: 13, color: "#4a3128" }}>
        📍 {appt.location_name}
      </div>

      {appt.status === "PENDING" && !isMine && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "8px", borderRadius: 10, background: "#e7b98a40", color: "#4a3128", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
          >
            거절
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 2, padding: "8px", borderRadius: 10, background: "var(--coral)", color: "#fff", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(244,111,117,0.3)" }}
          >
            ✓ 수락
          </button>
        </div>
      )}
      {appt.status === "PENDING" && isMine && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={onCancel}
            style={{ padding: "6px 14px", borderRadius: 10, background: "#e7b98a40", color: "#4a3128", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
