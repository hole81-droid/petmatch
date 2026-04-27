"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PERSONALITY_TAGS } from "@/constants/petData";
import type { Friendliness } from "@/types/database";

const FRIENDLINESS: { value: Friendliness; label: string }[] = [
  { value: "HIGH", label: "좋아해요" },
  { value: "MED",  label: "보통이에요" },
  { value: "LOW",  label: "조심해요" },
];

export default function OnboardingStep3() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [isVaccinated, setIsVaccinated] = useState(false);
  const [isNeutered, setIsNeutered]   = useState(false);
  const [needsMuzzle, setNeedsMuzzle] = useState(false);
  const [dogFriendly, setDogFriendly]     = useState<Friendliness>("MED");
  const [humanFriendly, setHumanFriendly] = useState<Friendliness>("MED");
  const [selectedTags, setSelectedTags]   = useState<string[]>([]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
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

    await supabase.from("pets").update({
      is_vaccinated:    isVaccinated,
      is_neutered:      isNeutered,
      needs_muzzle:     needsMuzzle,
      dog_friendly:     dogFriendly,
      human_friendly:   humanFriendly,
      personality_tags: selectedTags,
    }).eq("id", pet.id);

    setSaving(false);
    router.push("/onboarding/purpose");
  }

  const chipStyle = (selected: boolean) => ({
    background: selected ? "var(--matcha)" : "var(--latte-soft)",
    color: selected ? "var(--brown)" : "var(--pm-muted)",
    border: selected ? "2px solid var(--matcha-dark)" : "2px solid transparent",
  });

  const friendlinessStyle = (current: Friendliness, value: Friendliness) => ({
    background: current === value ? "var(--coral)" : "var(--latte-soft)",
    color: current === value ? "#fff" : "var(--brown)",
  });

  const toggleStyle = (active: boolean) => ({
    background: active ? "var(--matcha)" : "var(--latte-soft)",
  });

  return (
    <div
      className="rounded-3xl p-6 border"
      style={{ background: "rgba(255,255,255,0.72)", borderColor: "var(--line)", boxShadow: "0 12px 36px rgba(74,49,40,0.12)" }}
    >
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>성향 & 신뢰 정보</h2>
      <p className="text-sm mb-5" style={{ color: "var(--pm-muted)" }}>다른 보호자가 안심하고 만날 수 있도록 알려주세요</p>

      {/* 신뢰 뱃지 토글 */}
      <div className="space-y-3 mb-5">
        {[
          { label: "예방접종 완료", value: isVaccinated, set: setIsVaccinated, emoji: "💉" },
          { label: "중성화 완료",   value: isNeutered,   set: setIsNeutered,   emoji: "✂️" },
          { label: "공공장소 입마개 필요", value: needsMuzzle, set: setNeedsMuzzle, emoji: "😷" },
        ].map(({ label, value, set, emoji }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3 rounded-2xl border"
            style={{ borderColor: "var(--line)", background: "#fff" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {emoji} {label}
            </span>
            <button
              type="button"
              onClick={() => set(!value)}
              className="relative w-12 h-7 rounded-full transition-colors"
              style={toggleStyle(value)}
            >
              <span
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: value ? "calc(100% - 1.5rem)" : "0.25rem" }}
              />
            </button>
          </div>
        ))}
      </div>

      {/* 친화도 */}
      {[
        { label: "강아지 친화도", value: dogFriendly, set: setDogFriendly },
        { label: "사람 친화도",   value: humanFriendly, set: setHumanFriendly },
      ].map(({ label, value, set }) => (
        <div key={label} className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--pm-muted)" }}>{label}</label>
          <div className="flex gap-2">
            {FRIENDLINESS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => set(f.value as Friendliness)}
                className="flex-1 py-2 rounded-2xl text-xs font-bold"
                style={friendlinessStyle(value, f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 성격 태그 */}
      <div className="mb-5">
        <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--pm-muted)" }}>
          성격 태그 (복수 선택)
        </label>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
              style={chipStyle(selectedTags.includes(tag))}
            >
              {tag}
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
        {saving ? "저장 중..." : "다음 →"}
      </button>
    </div>
  );
}
