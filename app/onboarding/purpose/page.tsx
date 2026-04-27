"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PURPOSE_TAGS } from "@/constants/petData";

export default function OnboardingStep4() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function onSave() {
    if (selected.length === 0) { setError(true); return; }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("users").update({
      purpose_tags: selected,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    setSaving(false);
    router.push("/onboarding/lifestyle");
  }

  return (
    <div
      className="rounded-3xl p-6 border"
      style={{ background: "rgba(255,255,255,0.72)", borderColor: "var(--line)", boxShadow: "0 12px 36px rgba(74,49,40,0.12)" }}
    >
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>만남의 목적</h2>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>어떤 만남을 원하세요? (복수 선택)</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {PURPOSE_TAGS.map((tag) => {
          const active = selected.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => { toggle(tag.id); setError(false); }}
              className="flex flex-col items-center justify-center py-5 rounded-2xl border-2 font-bold text-sm transition-all"
              style={{
                background: active ? "var(--coral)" : "#fff",
                color: active ? "#fff" : "var(--brown)",
                borderColor: active ? "var(--coral)" : "var(--line)",
                boxShadow: active ? "0 8px 20px rgba(244,111,117,0.25)" : "none",
              }}
            >
              <span className="text-3xl mb-2">{tag.emoji}</span>
              {tag.label}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-center mb-3" style={{ color: "var(--coral)" }}>
          최소 1개를 선택해주세요
        </p>
      )}

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
