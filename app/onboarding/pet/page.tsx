"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { DOG_BREEDS, CAT_BREEDS } from "@/constants/petData";
import type { Species, PetGender } from "@/types/database";

const schema = z.object({
  name:      z.string().min(1, "이름을 입력해주세요"),
  species:   z.enum(["DOG", "CAT", "OTHER"]),
  breed:     z.string().min(1, "품종을 선택해주세요"),
  age_years: z.number().int().min(0).max(30),
  gender:    z.enum(["MALE", "FEMALE", "NEUTERED"]),
  weight_kg: z.number().min(0).max(100).optional(),
});

type FormData = z.infer<typeof schema>;

const SPECIES_OPTIONS: { value: Species; label: string; emoji: string }[] = [
  { value: "DOG", label: "강아지", emoji: "🐶" },
  { value: "CAT", label: "고양이", emoji: "🐱" },
  { value: "OTHER", label: "기타", emoji: "🐾" },
];

const GENDER_OPTIONS: { value: PetGender; label: string }[] = [
  { value: "MALE", label: "수컷" },
  { value: "FEMALE", label: "암컷" },
  { value: "NEUTERED", label: "중성화" },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { species: "DOG" },
  });

  const species = watch("species");
  const breedList = species === "DOG" ? DOG_BREEDS : species === "CAT" ? CAT_BREEDS : [];

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    setPhotos(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function onSubmit(data: FormData) {
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 반려동물 생성
    const { data: pet, error } = await supabase.from("pets").insert({
      owner_id:  user.id,
      name:      data.name,
      species:   data.species,
      breed:     data.breed,
      age_years: data.age_years,
      gender:    data.gender,
      weight_kg: data.weight_kg ?? null,
    }).select().single();

    if (error || !pet) { setUploading(false); return; }

    // 사진 업로드
    if (photos.length > 0) {
      const urls: string[] = [];
      for (const file of photos) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${pet.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("pet-photos").upload(path, file);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("pet-photos").getPublicUrl(path);
          urls.push(publicUrl);
        }
      }
      await supabase.from("pets").update({ photos: urls }).eq("id", pet.id);
    }

    setUploading(false);
    router.push("/onboarding/badges");
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
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>반려동물 정보</h2>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>우리 아이를 소개해주세요</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 종류 */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>종류</label>
          <div className="flex gap-2">
            {SPECIES_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setValue("species", opt.value); setValue("breed", ""); }}
                className="flex-1 py-2.5 rounded-2xl text-sm font-bold border transition-colors"
                style={chipStyle(species === opt.value)}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 이름 */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: "var(--muted)" }}>이름</label>
          <input
            {...register("name")}
            placeholder="예: 몽이"
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{ borderColor: errors.name ? "var(--coral)" : "var(--line)", background: "#fff", color: "var(--ink)" }}
          />
          {errors.name && <p className="text-xs mt-1 ml-1" style={{ color: "var(--coral)" }}>{errors.name.message}</p>}
        </div>

        {/* 품종 */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: "var(--muted)" }}>품종</label>
          {breedList.length > 0 ? (
            <select
              {...register("breed")}
              className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
              style={{ borderColor: errors.breed ? "var(--coral)" : "var(--line)", background: "#fff", color: "var(--ink)" }}
            >
              <option value="">선택해주세요</option>
              {breedList.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          ) : (
            <input
              {...register("breed")}
              placeholder="품종 입력"
              className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
              style={{ borderColor: "var(--line)", background: "#fff", color: "var(--ink)" }}
            />
          )}
          {errors.breed && <p className="text-xs mt-1 ml-1" style={{ color: "var(--coral)" }}>{errors.breed.message}</p>}
        </div>

        {/* 나이 · 성별 · 체중 */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: "var(--muted)" }}>나이(살)</label>
            <input
              {...register("age_years", { valueAsNumber: true })}
              type="number" min={0} max={30}
              placeholder="3"
              className="w-full px-3 py-3 rounded-2xl border text-sm outline-none text-center"
              style={{ borderColor: "var(--line)", background: "#fff", color: "var(--ink)" }}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: "var(--muted)" }}>성별</label>
            <select
              {...register("gender")}
              className="w-full px-2 py-3 rounded-2xl border text-sm outline-none"
              style={{ borderColor: "var(--line)", background: "#fff", color: "var(--ink)" }}
            >
              {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: "var(--muted)" }}>체중(kg)</label>
            <input
              {...register("weight_kg", { valueAsNumber: true })}
              type="number" step="0.1" min={0}
              placeholder="5.2"
              className="w-full px-3 py-3 rounded-2xl border text-sm outline-none text-center"
              style={{ borderColor: "var(--line)", background: "#fff", color: "var(--ink)" }}
            />
          </div>
        </div>

        {/* 사진 업로드 */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--muted)" }}>사진 (최대 5장)</label>
          <label
            className="flex items-center justify-center w-full h-14 rounded-2xl border-2 border-dashed cursor-pointer text-sm font-semibold"
            style={{ borderColor: "var(--latte)", color: "var(--brown)" }}
          >
            📷 사진 선택
            <input type="file" accept="image/*" multiple className="hidden" onChange={onPhotoChange} />
          </label>
          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-1.5 mt-2">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="aspect-square rounded-xl object-cover" />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="w-full py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-60"
          style={{ background: "var(--coral)", boxShadow: "0 8px 20px rgba(244,111,117,0.3)" }}
        >
          {uploading ? "업로드 중..." : isSubmitting ? "저장 중..." : "다음 →"}
        </button>
      </form>
    </div>
  );
}
