"use client";

import { useState } from "react";
import { CompatibilityBadge } from "./CompatibilityBadge";
import { ReportModal } from "./ReportModal";
import { PetPhoto } from "@/components/ui/PetPhoto";
import { Chip } from "@/components/ui/Chip";
import { PURPOSE_TAGS } from "@/constants/petData";
import type { DiscoveryPet } from "@/hooks/useDiscovery";

const GENDER_LABEL: Record<string, string> = { MALE: "수컷", FEMALE: "암컷", NEUTERED: "중성화" };

interface Props {
  data: DiscoveryPet;
  onTap: () => void;
  onBlock?: (ownerId: string) => void;
}

export function SwipeCard({ data, onTap, onBlock }: Props) {
  const { pet, owner, score } = data;
  const [showReport, setShowReport] = useState(false);

  const purposeLabels = PURPOSE_TAGS
    .filter((p) => owner.purpose_tags.includes(p.id))
    .map((p) => `${p.emoji} ${p.label}`);

  return (
    <div
      onClick={onTap}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 34,
        overflow: "hidden",
        background: "var(--paper)",
        boxShadow: "0 24px 60px rgba(74,49,40,0.18), 0 4px 12px rgba(74,49,40,0.08)",
        userSelect: "none",
        touchAction: "none",
        cursor: "grab",
      }}
    >
      {/* 사진 영역 (전체 높이) */}
      <PetPhoto
        photos={pet.photos}
        alt={pet.name}
        height="100%"
        fallbackEmoji={pet.species === "CAT" ? "🐱" : "🐶"}
      />

      {/* 상단 좌측: 호환성 점수 pill */}
      <div style={{ position: "absolute", top: 30, left: 16 }}>
        <CompatibilityBadge score={score.total} />
      </div>

      {/* 상단 우측: 신고 버튼 */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setShowReport(true); }}
        aria-label="신고"
        style={{
          position: "absolute",
          top: 30,
          right: 16,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.88)",
          border: "none",
          fontSize: 18,
          fontWeight: 900,
          color: "var(--brown)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 4px 12px rgba(74,49,40,0.18)",
        }}
      >
        ⋯
      </button>

      {/* 하단 정보 영역 (그라디언트 위) */}
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 22,
          color: "#fff",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <span className="h-serif" style={{ fontSize: 36, fontWeight: 700 }}>
            {pet.name}
          </span>
          <span className="h-serif" style={{ fontSize: 28, fontWeight: 400, opacity: 0.92 }}>
            {pet.age_years}
          </span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.92 }}>
          {pet.breed} · {GENDER_LABEL[pet.gender]} · {owner.region || "지역 미설정"}
        </div>

        {/* 칩 라인 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, pointerEvents: "auto" }}>
          {pet.is_vaccinated && <Chip variant="ghost" size="sm">💉 접종</Chip>}
          {pet.is_neutered   && <Chip variant="ghost" size="sm">✂️ 중성화</Chip>}
          {pet.needs_muzzle  && <Chip variant="ghost" size="sm">😷 입마개</Chip>}
          {purposeLabels.slice(0, 2).map((l) => (
            <Chip key={l} variant="ghost" size="sm">{l}</Chip>
          ))}
        </div>
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
