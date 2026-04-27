"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { WALK_TIME_SLOTS } from "@/constants/petData";
import type { DiscoveryFilters } from "@/hooks/useDiscovery";

interface Props {
  filters: DiscoveryFilters;
  onApply: (f: DiscoveryFilters) => void;
  onClose: () => void;
}

const SPECIES_OPTS = [
  { value: "", label: "전체" },
  { value: "DOG", label: "강아지" },
  { value: "CAT", label: "고양이" },
  { value: "OTHER", label: "기타" },
];
const GENDER_OPTS = [
  { value: "", label: "전체" },
  { value: "MALE", label: "수컷" },
  { value: "FEMALE", label: "암컷" },
  { value: "NEUTERED", label: "중성화" },
];
const CAFE_OPTS = [
  { value: "", label: "전체" },
  { value: "LOVES", label: "좋아해요" },
  { value: "OK", label: "괜찮아요" },
  { value: "NO", label: "선호 안 해요" },
];

export function FilterPanel({ filters, onApply, onClose }: Props) {
  const [local, setLocal] = useState<DiscoveryFilters>({ ...filters });

  function toggleSlot(hours: readonly number[]) {
    const current = local.timeSlots ?? [];
    const allIn = hours.every((h) => current.includes(h));
    if (allIn) {
      setLocal({ ...local, timeSlots: current.filter((h) => !hours.includes(h)) });
    } else {
      setLocal({ ...local, timeSlots: [...new Set([...current, ...hours])] });
    }
  }
  function isSlotActive(hours: readonly number[]) {
    return hours.some((h) => (local.timeSlots ?? []).includes(h));
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(43,29,24,0.5)",
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 430,
          margin: "0 auto",
          background: "var(--cream)",
          borderRadius: "32px 32px 0 0",
          padding: "20px 22px 36px",
          maxHeight: "88dvh",
          overflowY: "auto",
          boxShadow: "0 -16px 40px rgba(74,49,40,0.18)",
        }}
      >
        {/* 핸들바 */}
        <div style={{ width: 44, height: 5, borderRadius: 99, background: "var(--line)", margin: "0 auto 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <span className="h-serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>탐색 필터</span>
          <button
            type="button"
            onClick={() => setLocal({})}
            style={{ fontSize: 13, fontWeight: 800, color: "var(--coral)", background: "none", border: "none", cursor: "pointer" }}
          >
            초기화
          </button>
        </div>

        <Section label="종류">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SPECIES_OPTS.map((o) => (
              <Chip
                key={o.value}
                active={local.species === o.value || (!local.species && o.value === "")}
                onClick={() => setLocal({ ...local, species: o.value || undefined })}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section label="성별">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {GENDER_OPTS.map((o) => (
              <Chip
                key={o.value}
                active={local.gender === o.value || (!local.gender && o.value === "")}
                onClick={() => setLocal({ ...local, gender: o.value || undefined })}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section label="나이 범위">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="number" min={0} max={30} placeholder="최소"
              value={local.minAge ?? ""}
              onChange={(e) => setLocal({ ...local, minAge: e.target.value ? Number(e.target.value) : undefined })}
              style={{ width: 80, padding: "10px 14px", borderRadius: 14, border: "1.5px solid var(--line)", fontSize: 14, fontWeight: 700, color: "var(--ink)", background: "#fff", outline: "none" }}
            />
            <span style={{ color: "var(--pm-muted)", fontWeight: 700 }}>~</span>
            <input
              type="number" min={0} max={30} placeholder="최대"
              value={local.maxAge ?? ""}
              onChange={(e) => setLocal({ ...local, maxAge: e.target.value ? Number(e.target.value) : undefined })}
              style={{ width: 80, padding: "10px 14px", borderRadius: 14, border: "1.5px solid var(--line)", fontSize: 14, fontWeight: 700, color: "var(--ink)", background: "#fff", outline: "none" }}
            />
            <span style={{ color: "var(--pm-muted)", fontSize: 13, fontWeight: 700 }}>살</span>
          </div>
        </Section>

        <Section label="산책 시간대">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {WALK_TIME_SLOTS.map((s) => (
              <Chip
                key={s.label}
                active={isSlotActive(s.hours)}
                onClick={() => toggleSlot(s.hours)}
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section label="펫 카페 선호">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CAFE_OPTS.map((o) => (
              <Chip
                key={o.value}
                active={local.cafePref === o.value || (!local.cafePref && o.value === "")}
                onClick={() => setLocal({ ...local, cafePref: o.value || undefined })}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </Section>

        <button
          type="button"
          onClick={() => { onApply(local); onClose(); }}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "16px",
            borderRadius: 999,
            background: "var(--coral)",
            color: "#fff",
            fontWeight: 950,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 16px 28px rgba(244,111,117,0.32)",
            letterSpacing: "0.02em",
          }}
        >
          필터 적용
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="label-mini" style={{ marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}
