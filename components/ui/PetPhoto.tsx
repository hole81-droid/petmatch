"use client";

import { useState } from "react";

interface Props {
  photos: string[];
  alt: string;
  height?: string | number;
  fallbackEmoji?: string;
}

// 사진 영역 + 상단 점선 탭 + 좌우 탭 영역 + 하단 그라디언트 오버레이
export function PetPhoto({ photos, alt, height = "100%", fallbackEmoji = "🐾" }: Props) {
  const [idx, setIdx] = useState(0);
  const list = photos.length > 0 ? photos : [];

  function next(e: React.MouseEvent) {
    e.stopPropagation();
    if (list.length > 1) setIdx((i) => (i + 1) % list.length);
  }
  function prev(e: React.MouseEvent) {
    e.stopPropagation();
    if (list.length > 1) setIdx((i) => (i - 1 + list.length) % list.length);
  }

  return (
    <div style={{ position: "relative", width: "100%", height, overflow: "hidden", background: "linear-gradient(145deg, #c98d64, #f5c9a2 52%, #79513d)" }}>
      {/* 사진 또는 placeholder */}
      {list.length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={list[idx]}
          alt={alt}
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: 80, opacity: 0.4 }}>
          {fallbackEmoji}
        </div>
      )}

      {/* 상단 점선 탭 (사진 인디케이터) */}
      {list.length > 1 && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            right: 14,
            display: "grid",
            gridTemplateColumns: `repeat(${list.length}, 1fr)`,
            gap: 5,
          }}
        >
          {list.map((_, i) => (
            <span
              key={i}
              style={{
                height: 4,
                borderRadius: 99,
                background: i === idx ? "#fff" : "rgba(255,255,255,0.45)",
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>
      )}

      {/* 사진 좌우 탭 영역 (드래그와 충돌 방지하기 위해 작게) */}
      {list.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 사진"
            onClick={prev}
            style={{ position: "absolute", left: 0, top: 30, bottom: 0, width: "30%", background: "transparent", border: "none", cursor: "pointer" }}
          />
          <button
            type="button"
            aria-label="다음 사진"
            onClick={next}
            style={{ position: "absolute", right: 0, top: 30, bottom: 0, width: "30%", background: "transparent", border: "none", cursor: "pointer" }}
          />
        </>
      )}

      {/* 하단 그라디언트 (텍스트 가독성) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, transparent 35%, rgba(43,29,24,0.78))",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
