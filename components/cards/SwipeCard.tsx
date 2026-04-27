"use client";

import { useState } from "react";
import { CompatibilityBadge } from "./CompatibilityBadge";
import { ReportModal } from "./ReportModal";
import { PURPOSE_TAGS } from "@/constants/petData";
import type { DiscoveryPet } from "@/hooks/useDiscovery";

const GENDER_LABEL: Record<string, string> = { MALE: "수컷", FEMALE: "암컷", NEUTERED: "중성화" };

interface Props {
  data: DiscoveryPet;
  onTap: () => void;
  onBlock?: (ownerId: string) => void;
  style?: React.CSSProperties;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function SwipeCard({ data, onTap, onBlock, style, dragHandleProps }: Props) {
  const { pet, owner, score } = data;
  const [photoIdx, setPhotoIdx]   = useState(0);
  const [showReport, setShowReport] = useState(false);

  const photos = pet.photos.length > 0
    ? pet.photos
    : ["/placeholder-pet.png"];

  const purposeLabels = PURPOSE_TAGS
    .filter((p) => owner.purpose_tags.includes(p.id))
    .map((p) => `${p.emoji} ${p.label}`);

  function nextPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIdx((i) => (i + 1) % photos.length);
  }
  function prevPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  }

  return (
    <div
      style={{
        position: "absolute", inset: 0,
        borderRadius: "24px",
        overflow: "hidden",
        background: "#fff7ed",
        boxShadow: "0 12px 40px rgba(74,49,40,0.18)",
        userSelect: "none",
        touchAction: "none",
        ...style,
      }}
      onClick={onTap}
      {...dragHandleProps}
    >
      {/* Photo area */}
      <div style={{ position: "relative", height: "62%", background: "#e7b98a" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[photoIdx]}
          alt={pet.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          draggable={false}
        />

        {/* Photo nav */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "40%", background: "transparent" }}
              aria-label="이전 사진"
            />
            <button
              onClick={nextPhoto}
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "40%", background: "transparent" }}
              aria-label="다음 사진"
            />
            <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
              {photos.map((_, i) => (
                <div
                  key={i}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: i === photoIdx ? "#fff" : "rgba(255,255,255,0.5)" }}
                />
              ))}
            </div>
          </>
        )}

        {/* Compatibility badge + report button */}
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6, alignItems: "center" }}>
          <CompatibilityBadge score={score.total} size="sm" />
          <button
            onClick={(e) => { e.stopPropagation(); setShowReport(true); }}
            style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.7)", border: "none", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="신고"
          >
            ⋯
          </button>
        </div>
      </div>

      {/* Info area */}
      <div style={{ padding: "14px 16px", height: "38%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#2b1d18" }}>{pet.name}</span>
            <span style={{ fontSize: 13, color: "#8c7568" }}>{pet.age_years}살 · {GENDER_LABEL[pet.gender]}</span>
          </div>
          <div style={{ fontSize: 13, color: "#8c7568", marginTop: 2 }}>
            {pet.breed} · {owner.region || "지역 미설정"}
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {pet.is_vaccinated && <Badge>💉 접종</Badge>}
          {pet.is_neutered   && <Badge>✂️ 중성화</Badge>}
          {pet.needs_muzzle  && <Badge>😷 입마개</Badge>}
        </div>

        {/* Purpose tags */}
        {purposeLabels.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {purposeLabels.map((l) => (
              <span key={l} style={{ fontSize: 11, background: "#fff0e6", color: "#4a3128", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>
                {l}
              </span>
            ))}
          </div>
        )}

        <div style={{ fontSize: 11, color: "#c4b5ad", textAlign: "center" }}>탭해서 궁합 자세히 보기</div>
      </div>

      {showReport && (
        <ReportModal
          reportedUserId={owner.id}
          petName={pet.name}
          onClose={() => setShowReport(false)}
          onBlock={() => onBlock?.(owner.id)}
        />
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11, background: "#f0f9f4", color: "#4a3128", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>
      {children}
    </span>
  );
}
