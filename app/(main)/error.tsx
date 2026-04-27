"use client";

import { useEffect } from "react";

export default function MainError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80dvh", gap: 12, padding: 24 }}>
      <span style={{ fontSize: 52 }}>😿</span>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#2b1d18", textAlign: "center" }}>문제가 생겼어요</div>
      <div style={{ fontSize: 13, color: "#8c7568", textAlign: "center", lineHeight: 1.6 }}>
        연결을 확인하고 다시 시도해주세요
      </div>
      <button
        onClick={reset}
        style={{ marginTop: 8, padding: "12px 28px", borderRadius: 16, background: "var(--coral)", color: "#fff", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer" }}
      >
        다시 시도
      </button>
    </div>
  );
}
