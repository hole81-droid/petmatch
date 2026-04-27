"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 해요").max(20, "20자 이하로 입력해주세요"),
  region:   z.string().min(2, "동네를 입력해주세요"),
  bio:      z.string().max(100, "100자 이하로 입력해주세요").optional(),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingStep1() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("users").update({
      nickname: data.nickname,
      region:   data.region,
      bio:      data.bio ?? "",
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    router.push("/onboarding/pet");
  }

  return (
    <div
      className="rounded-3xl p-6 border"
      style={{ background: "rgba(255,255,255,0.72)", borderColor: "var(--line)", boxShadow: "0 12px 36px rgba(74,49,40,0.12)" }}
    >
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>보호자 정보</h2>
      <p className="text-sm mb-5" style={{ color: "var(--pm-muted)" }}>내 소개를 입력해주세요</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: "var(--pm-muted)" }}>닉네임</label>
          <input
            {...register("nickname")}
            placeholder="예: 몽이아빠"
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{ borderColor: errors.nickname ? "var(--coral)" : "var(--line)", background: "#fff", color: "var(--ink)" }}
          />
          {errors.nickname && <p className="text-xs mt-1 ml-1" style={{ color: "var(--coral)" }}>{errors.nickname.message}</p>}
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: "var(--pm-muted)" }}>동네</label>
          <input
            {...register("region")}
            placeholder="예: 마포구 합정동"
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{ borderColor: errors.region ? "var(--coral)" : "var(--line)", background: "#fff", color: "var(--ink)" }}
          />
          {errors.region && <p className="text-xs mt-1 ml-1" style={{ color: "var(--coral)" }}>{errors.region.message}</p>}
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: "var(--pm-muted)" }}>한 줄 소개 (선택)</label>
          <textarea
            {...register("bio")}
            placeholder="예: 매일 아침 한강 산책해요 🌅"
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none"
            style={{ borderColor: "var(--line)", background: "#fff", color: "var(--ink)" }}
          />
          {errors.bio && <p className="text-xs mt-1 ml-1" style={{ color: "var(--coral)" }}>{errors.bio.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-60"
          style={{ background: "var(--coral)", boxShadow: "0 8px 20px rgba(244,111,117,0.3)" }}
        >
          {isSubmitting ? "저장 중..." : "다음 →"}
        </button>
      </form>
    </div>
  );
}
