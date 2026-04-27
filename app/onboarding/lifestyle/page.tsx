"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WALK_TIME_SLOTS, PLACE_TYPE_TAGS } from "@/constants/petData";
import type { CafePref } from "@/types/database";

const CAFE_OPTIONS: { value: CafePref; label: string; emoji: string }[] = [
  { value: "LOVES", label: "좋아해요",    emoji: "☕" },
  { value: "OK",    label: "괜찮아요",    emoji: "🙂" },
  { value: "NO",    label: "선호 안 해요", emoji: "🚫" },
];

export default function OnboardingStep5() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [selectedSlots, setSelectedSlots]   = useState<number[]>([]);
  const [cafePref, setCafePref]             = useState<CafePref>("OK");
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [locations, setLocations]           = useState(["", "", ""]);

  function toggleSlot(hours: readonly number[]) {
    const hoursArr = [...hours];
    const allSelected = hoursArr.every((h) => selectedSlots.includes(h));
    if (allSelected) {
      setSelectedSlots((prev) => prev.filter((h) => !hoursArr.includes(h)));
    } else {
      setSelectedSlots((prev) => [...new Set([...prev, ...hoursArr])]);
    }
  }

  function isSlotSelected(hours: readonly number[]) {
    return hours.some((h) => selectedSlots.includes(h));
  }

  function togglePlace(place: string) {
    setSelectedPlaces((prev) =>
      prev.includes(place) ? prev.filter((p) => p !== place) : [...prev, place]
    );
  }

  async function onSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: pet } = await supabase
      .from("pets").select("id").eq("owner_id", user.id).single();
    if (!pet) return;

    const favoriteLocations = locations
      .filter((l) => l.trim().length > 0)
      .map((name) => ({ name, radius_m: 1000 }));

    await supabase.from("pet_lifestyles").upsert({
      pet_id:             pet.id,
      walk_time_slots:    selectedSlots,
      walk_days:          [],
      favorite_locations: favoriteLocations,
      cafe_pref:          cafePref,
      place_type_tags:    selectedPlaces,
      updated_at:         new Date().toISOString(),
    }, { onConflict: "pet_id" });

    setSaving(false);
    router.push("/discovery");
  }

  const chipStyle = (selected: boolean) => ({
    background: selected ? "var(--coral)" : "var(--latte-soft)",
    color: selected ? "#fff" : "var(--brown)",
  });

  return (
    <div
      className="rounded-3xl p-6 border"
      style={{ background: "rgba(255,255,255,0.72)", borderColor: "var(--line)", boxShadow: "0 12px 36px rgba(74,49,40,0.12)" }}
    >
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>라이프스타일</h2>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>일상 패턴을 알려주시면 잘 맞는 분을 찾아드려요</p>

      {/* 산책 시간대 */}
      <div className="mb-5">
        <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>
          산책 시간대 (복수 선택)
        </label>
        <div className="flex flex-wrap gap-2">
          {WALK_TIME_SLOTS.map((slot) => (
            <button
              key={slot.label}
              type="button"
              onClick={() => toggleSlot(slot.hours)}
              className="px-3 py-2 rounded-full text-xs font-bold"
              style={chipStyle(isSlotSelected(slot.hours))}
            >
              {slot.label}
              <span className="ml-1 opacity-70">{slot.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 자주 가는 장소 */}
      <div className="mb-5">
        <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>
          자주 가는 공원·장소 (최대 3곳)
        </label>
        {locations.map((loc, i) => (
          <input
            key={i}
            value={loc}
            onChange={(e) => {
              const next = [...locations];
              next[i] = e.target.value;
              setLocations(next);
            }}
            placeholder={`예: ${["월드컵공원", "한강 망원지구", "서울숲"][i]}`}
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none mb-2"
            style={{ borderColor: "var(--line)", background: "#fff", color: "var(--ink)" }}
          />
        ))}
      </div>

      {/* 카페 선호 */}
      <div className="mb-5">
        <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>
          펫 카페 동반 선호
        </label>
        <div className="flex gap-2">
          {CAFE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCafePref(opt.value)}
              className="flex-1 py-2.5 rounded-2xl text-xs font-bold"
              style={chipStyle(cafePref === opt.value)}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 장소 유형 */}
      <div className="mb-5">
        <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>
          선호 장소 유형 (복수 선택)
        </label>
        <div className="flex flex-wrap gap-2">
          {PLACE_TYPE_TAGS.map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => togglePlace(place)}
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={chipStyle(selectedPlaces.includes(place))}
            >
              {place}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-60"
        style={{ background: "var(--coral)", boxShadow: "0 8px 20px rgba(244,111,117,0.3)" }}
      >
        {saving ? "저장 중..." : "🐾 PetMatch 시작하기"}
      </button>
    </div>
  );
}
