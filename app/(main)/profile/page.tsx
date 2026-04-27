"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DOG_BREEDS, CAT_BREEDS, PERSONALITY_TAGS, PURPOSE_TAGS, WALK_TIME_SLOTS, PLACE_TYPE_TAGS } from "@/constants/petData";
import type { Species, PetGender, CafePref, Friendliness } from "@/types/database";

type Tab = "owner" | "pet" | "lifestyle";

const GENDER_OPTS: { value: PetGender; label: string }[] = [
  { value: "MALE", label: "수컷" }, { value: "FEMALE", label: "암컷" }, { value: "NEUTERED", label: "중성화" },
];
const SPECIES_OPTS: { value: Species; label: string }[] = [
  { value: "DOG", label: "🐶 강아지" }, { value: "CAT", label: "🐱 고양이" }, { value: "OTHER", label: "🐾 기타" },
];
const CAFE_OPTS: { value: CafePref; label: string }[] = [
  { value: "LOVES", label: "좋아해요" }, { value: "OK", label: "괜찮아요" }, { value: "NO", label: "선호 안 해요" },
];
const FRIENDLY_OPTS: { value: Friendliness; label: string }[] = [
  { value: "HIGH", label: "높음" }, { value: "MED", label: "보통" }, { value: "LOW", label: "낮음" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab]       = useState<Tab>("owner");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [petId, setPetId]   = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  // Owner fields
  const [nickname, setNickname] = useState("");
  const [region, setRegion]     = useState("");
  const [bio, setBio]           = useState("");
  const [purposeTags, setPurposeTags] = useState<string[]>([]);

  // Pet fields
  const [petName, setPetName]     = useState("");
  const [species, setSpecies]     = useState<Species>("DOG");
  const [breed, setBreed]         = useState("");
  const [ageYears, setAgeYears]   = useState(0);
  const [gender, setGender]       = useState<PetGender>("MALE");
  const [weightKg, setWeightKg]   = useState<number | "">("");
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [isNeutered, setIsNeutered]     = useState(false);
  const [needsMuzzle, setNeedsMuzzle]   = useState(false);
  const [dogFriendly, setDogFriendly]   = useState<Friendliness>("MED");
  const [humanFriendly, setHumanFriendly] = useState<Friendliness>("HIGH");
  const [personalityTags, setPersonalityTags] = useState<string[]>([]);

  // Lifestyle fields
  const [walkSlots, setWalkSlots]         = useState<number[]>([]);
  const [cafePref, setCafePref]           = useState<CafePref>("OK");
  const [placeTypeTags, setPlaceTypeTags] = useState<string[]>([]);
  const [locations, setLocations]         = useState(["", "", ""]);

  useEffect(() => { void load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUserId(user.id);

    const [{ data: u }, { data: p }] = await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase.from("pets").select("*").eq("owner_id", user.id).single(),
    ]);

    if (u) {
      setNickname((u.nickname as string) ?? "");
      setRegion((u.region as string) ?? "");
      setBio((u.bio as string) ?? "");
      setPurposeTags((u.purpose_tags as string[]) ?? []);
    }
    if (p) {
      setPetId(p.id as string);
      setPetName((p.name as string) ?? "");
      setSpecies((p.species as Species) ?? "DOG");
      setBreed((p.breed as string) ?? "");
      setAgeYears((p.age_years as number) ?? 0);
      setGender((p.gender as PetGender) ?? "MALE");
      setWeightKg((p.weight_kg as number | null) ?? "");
      setPhotos((p.photos as string[]) ?? []);
      setIsVaccinated((p.is_vaccinated as boolean) ?? false);
      setIsNeutered((p.is_neutered as boolean) ?? false);
      setNeedsMuzzle((p.needs_muzzle as boolean) ?? false);
      setDogFriendly((p.dog_friendly as Friendliness) ?? "MED");
      setHumanFriendly((p.human_friendly as Friendliness) ?? "HIGH");
      setPersonalityTags((p.personality_tags as string[]) ?? []);

      const { data: ls } = await supabase.from("pet_lifestyles").select("*").eq("pet_id", p.id).single();
      if (ls) {
        setWalkSlots((ls.walk_time_slots as number[]) ?? []);
        setCafePref((ls.cafe_pref as CafePref) ?? "OK");
        setPlaceTypeTags((ls.place_type_tags as string[]) ?? []);
        const locs = ((ls.favorite_locations as { name: string }[]) ?? []).map((l) => l.name);
        setLocations([locs[0] ?? "", locs[1] ?? "", locs[2] ?? ""]);
      }
    }
  }

  async function saveOwner() {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("users").update({ nickname, region, bio, purpose_tags: purposeTags }).eq("id", userId);
    setSaving(false);
    alert("저장됐어요!");
  }

  async function savePet() {
    if (!petId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("pets").update({
      name: petName, species, breed, age_years: ageYears, gender,
      weight_kg: weightKg === "" ? null : weightKg,
      is_vaccinated: isVaccinated, is_neutered: isNeutered, needs_muzzle: needsMuzzle,
      dog_friendly: dogFriendly, human_friendly: humanFriendly,
      personality_tags: personalityTags,
    }).eq("id", petId);
    setSaving(false);
    alert("저장됐어요!");
  }

  async function saveLifestyle() {
    if (!petId) return;
    setSaving(true);
    const supabase = createClient();
    const favoriteLocations = locations.filter((l) => l.trim()).map((name) => ({ name, radius_m: 1000 }));
    await supabase.from("pet_lifestyles").upsert({
      pet_id: petId, walk_time_slots: walkSlots, walk_days: [],
      favorite_locations: favoriteLocations,
      cafe_pref: cafePref, place_type_tags: placeTypeTags,
      updated_at: new Date().toISOString(),
    }, { onConflict: "pet_id" });
    setSaving(false);
    alert("저장됐어요!");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    if (!petId || !userId) return;
    const file = e.target.files?.[0];
    if (!file || photos.length >= 5) return;
    const supabase = createClient();
    const ext  = file.name.split(".").pop();
    const path = `${userId}/${petId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("pet-photos").upload(path, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("pet-photos").getPublicUrl(path);
      const next = [...photos, publicUrl];
      setPhotos(next);
      await supabase.from("pets").update({ photos: next }).eq("id", petId);
    }
    e.target.value = "";
  }

  const chip = (active: boolean) => ({
    padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
    background: active ? "var(--coral)" : "var(--latte-soft)",
    color: active ? "#fff" : "var(--brown)",
  } as React.CSSProperties);

  const breedList = species === "DOG" ? DOG_BREEDS : species === "CAT" ? CAT_BREEDS : [];

  return (
    <div style={{ minHeight: "100%", background: "var(--cream)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px" }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#2b1d18" }}>🐶 프로필</span>
        <button
          onClick={handleLogout}
          style={{ fontSize: 12, fontWeight: 700, color: "#8c7568", background: "none", border: "1px solid var(--line)", borderRadius: 10, padding: "6px 12px", cursor: "pointer" }}
        >
          로그아웃
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "0 20px 12px" }}>
        {(["owner", "pet", "lifestyle"] as Tab[]).map((t) => {
          const label = t === "owner" ? "나의 정보" : t === "pet" ? "반려동물" : "라이프스타일";
          return (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 4px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: tab === t ? "var(--coral)" : "var(--latte-soft)", color: tab === t ? "#fff" : "var(--brown)" }}>
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "0 20px 100px" }}>
        {/* ===== Owner Tab ===== */}
        {tab === "owner" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="닉네임">
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} style={inputStyle} placeholder="닉네임" />
            </Field>
            <Field label="동네">
              <input value={region} onChange={(e) => setRegion(e.target.value)} style={inputStyle} placeholder="예: 마포구" />
            </Field>
            <Field label="소개글">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none" }} placeholder="우리 아이를 소개해주세요" />
            </Field>
            <Field label="목적 태그">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PURPOSE_TAGS.map((p) => (
                  <button key={p.id} style={chip(purposeTags.includes(p.id))} onClick={() => setPurposeTags((prev) => prev.includes(p.id) ? prev.filter((t) => t !== p.id) : [...prev, p.id])}>
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
            </Field>
            <SaveBtn onClick={saveOwner} saving={saving} />
          </div>
        )}

        {/* ===== Pet Tab ===== */}
        {tab === "pet" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Photos */}
            <Field label="사진 (최대 5장)">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {photos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" style={{ width: 72, height: 72, borderRadius: 14, objectFit: "cover" }} />
                ))}
                {photos.length < 5 && (
                  <label style={{ width: 72, height: 72, borderRadius: 14, border: "2px dashed var(--latte)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, cursor: "pointer", color: "var(--brown)" }}>
                    +<input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoAdd} />
                  </label>
                )}
              </div>
            </Field>
            <Field label="종류">
              <div style={{ display: "flex", gap: 8 }}>
                {SPECIES_OPTS.map((o) => <button key={o.value} style={chip(species === o.value)} onClick={() => { setSpecies(o.value); setBreed(""); }}>{o.label}</button>)}
              </div>
            </Field>
            <Field label="이름">
              <input value={petName} onChange={(e) => setPetName(e.target.value)} style={inputStyle} placeholder="예: 몽이" />
            </Field>
            <Field label="품종">
              {breedList.length > 0 ? (
                <select value={breed} onChange={(e) => setBreed(e.target.value)} style={inputStyle}>
                  <option value="">선택</option>
                  {breedList.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : (
                <input value={breed} onChange={(e) => setBreed(e.target.value)} style={inputStyle} placeholder="품종 입력" />
              )}
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field label="나이(살)">
                <input type="number" value={ageYears} min={0} max={30} onChange={(e) => setAgeYears(Number(e.target.value))} style={{ ...inputStyle, textAlign: "center" }} />
              </Field>
              <Field label="성별">
                <select value={gender} onChange={(e) => setGender(e.target.value as PetGender)} style={inputStyle}>
                  {GENDER_OPTS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </Field>
              <Field label="체중(kg)">
                <input type="number" step="0.1" min={0} value={weightKg} onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))} style={{ ...inputStyle, textAlign: "center" }} placeholder="5.0" />
              </Field>
            </div>
            <Field label="신뢰 뱃지">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "💉 예방접종 완료", value: isVaccinated, set: setIsVaccinated },
                  { label: "✂️ 중성화 완료",   value: isNeutered,   set: setIsNeutered },
                  { label: "😷 입마개 착용",   value: needsMuzzle,  set: setNeedsMuzzle },
                ].map(({ label, value, set }) => (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--coral)" }} />
                    <span style={{ fontSize: 14, color: "#2b1d18", fontWeight: 600 }}>{label}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="강아지 친화도">
              <div style={{ display: "flex", gap: 8 }}>
                {FRIENDLY_OPTS.map((o) => <button key={o.value} style={chip(dogFriendly === o.value)} onClick={() => setDogFriendly(o.value)}>{o.label}</button>)}
              </div>
            </Field>
            <Field label="사람 친화도">
              <div style={{ display: "flex", gap: 8 }}>
                {FRIENDLY_OPTS.map((o) => <button key={o.value} style={chip(humanFriendly === o.value)} onClick={() => setHumanFriendly(o.value)}>{o.label}</button>)}
              </div>
            </Field>
            <Field label="성격 태그">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PERSONALITY_TAGS.map((t) => (
                  <button key={t} style={chip(personalityTags.includes(t))} onClick={() => setPersonalityTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}>{t}</button>
                ))}
              </div>
            </Field>
            <SaveBtn onClick={savePet} saving={saving} />
          </div>
        )}

        {/* ===== Lifestyle Tab ===== */}
        {tab === "lifestyle" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="산책 시간대">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {WALK_TIME_SLOTS.map((s) => {
                  const active = s.hours.some((h) => walkSlots.includes(h));
                  return (
                    <button key={s.label} style={chip(active)} onClick={() => {
                      const hrs = [...s.hours] as number[];
                      const allIn = hrs.every((h) => walkSlots.includes(h));
                      setWalkSlots(allIn ? walkSlots.filter((h) => !hrs.includes(h)) : [...new Set([...walkSlots, ...hrs])]);
                    }}>{s.label}</button>
                  );
                })}
              </div>
            </Field>
            <Field label="자주 가는 장소 (최대 3곳)">
              {locations.map((loc, i) => (
                <input key={i} value={loc} onChange={(e) => { const n = [...locations]; n[i] = e.target.value; setLocations(n); }}
                  placeholder={`예: ${["월드컵공원", "한강 망원지구", "서울숲"][i]}`}
                  style={{ ...inputStyle, marginBottom: i < 2 ? 8 : 0 }} />
              ))}
            </Field>
            <Field label="펫 카페 선호">
              <div style={{ display: "flex", gap: 8 }}>
                {CAFE_OPTS.map((o) => <button key={o.value} style={chip(cafePref === o.value)} onClick={() => setCafePref(o.value)}>{o.label}</button>)}
              </div>
            </Field>
            <Field label="선호 장소 유형">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PLACE_TYPE_TAGS.map((t) => (
                  <button key={t} style={chip(placeTypeTags.includes(t))} onClick={() => setPlaceTypeTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}>{t}</button>
                ))}
              </div>
            </Field>
            <SaveBtn onClick={saveLifestyle} saving={saving} />
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 14,
  border: "1.5px solid var(--line)", fontSize: 14,
  color: "#2b1d18", background: "#fff", outline: "none",
  boxSizing: "border-box",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8c7568", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{ width: "100%", padding: 14, borderRadius: 18, background: "var(--coral)", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 6px 16px rgba(244,111,117,0.3)", marginTop: 8, opacity: saving ? 0.6 : 1 }}
    >
      {saving ? "저장 중..." : "저장하기"}
    </button>
  );
}
