"use client";

import type { Message } from "@/types/database";

interface Props {
  msg: Message;
  isMine: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessage({ msg, isMine }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexDirection: isMine ? "row-reverse" : "row" }}>
        {msg.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={msg.image_url}
            alt="사진"
            style={{ maxWidth: 200, borderRadius: 16, cursor: "pointer" }}
            onClick={() => window.open(msg.image_url!, "_blank")}
          />
        ) : (
          <div
            style={{
              maxWidth: "72%",
              padding: "10px 14px",
              borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: isMine ? "var(--coral)" : "#fff",
              color: isMine ? "#fff" : "#2b1d18",
              fontSize: 14,
              lineHeight: 1.5,
              boxShadow: "0 2px 8px rgba(74,49,40,0.08)",
              wordBreak: "break-word",
            }}
          >
            {msg.content}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", gap: 2 }}>
          <span style={{ fontSize: 10, color: "#c4b5ad" }}>{formatTime(msg.created_at)}</span>
          {isMine && (
            <span style={{ fontSize: 10, color: msg.is_read ? "var(--coral)" : "#c4b5ad" }}>
              {msg.is_read ? "읽음" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
