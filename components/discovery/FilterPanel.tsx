"use client";

import { useState } from "react";
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

  const chip = (active: boolean) => ({
    background: active ? "var(--coral)" : "var(--latte-soft)",
    color: active ? "#fff" : "var(--brown)",
    border: "none",
    borderRadius: 99,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  } as React.CSSProperties);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(43,29,24,0.5)",
        display: "flex", alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 430, margin: "0 auto",
          background: "#fff7ed",
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 40px",
          maxHeight: "85dvh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#2b1d18" }}>필터</span>
          <button onClick={() => { setLocal({}); }} style={{ fontSize: 12, color: "#8c7568", background: "none", border: "none", cursor: "pointer" }}>초기화</button>
        </div>

        <Section label="종류">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SPECIES_OPTS.map((o) => (
              <button key={o.value} style={chip(local.species === o.value || (!local.species && o.value === ""))}
                onClick={() => setLocal({ ...local, species: o.value || undefined })}>
                {o.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="성별">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {GENDER_OPTS.map((o) => (
              <button key={o.value} style={chip(local.gender === o.value || (!local.gender && o.value === ""))}
                onClick={() => setLocal({ ...local, gender: o.value || undefined })}>
                {o.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="나이 범위">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="number" min={0} max={30} placeholder="최소"
              value={local.minAge ?? ""}
              onChange={(e) => setLocal({ ...local, minAge: e.target.value ? Number(e.target.value) : undefined })}
              style={{ width: 72, padding: "8px 12px", borderRadius: 12, border: "1.5px solid var(--line)", fontSize: 13, color: "#2b1d18", background: "#fff" }}
            />
            <span style={{ color: "#8c7568" }}>~</span>
            <input
              type="number" min={0} max={30} placeholder="최대"
              value={local.maxAge ?? ""}
              onChange={(e) => setLocal({ ...local, maxAge: e.target.value ? Number(e.target.value) : undefined })}
              style={{ width: 72, padding: "8px 12px", borderRadius: 12, border: "1.5px solid var(--line)", fontSize: 13, color: "#2b1d18", background: "#fff" }}
            />
            <span style={{ color: "#8c7568", fontSize: 13 }}>살</span>
          </div>
        </Section>

        <Section label="산책 시간대">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {WALK_TIME_SLOTS.map((s) => (
              <button key={s.label} style={chip(isSlotActive(s.hours))} onClick={() => toggleSlot(s.hours)}>
                {s.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label="펫 카페 선호">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CAFE_OPTS.map((o) => (
              <button key={o.value} style={chip(local.cafePref === o.value || (!local.cafePref && o.value === ""))}
                onClick={() => setLocal({ ...local, cafePref: o.value || undefined })}>
                {o.label}
              </button>
            ))}
          </div>
        </Section>

        <button
          onClick={() => { onApply(local); onClose(); }}
          style={{ width: "100%", marginTop: 8, padding: "14px", borderRadius: 18, background: "var(--coral)", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 6px 16px rgba(244,111,117,0.3)" }}
        >
          필터 적용
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8c7568", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
