import { getEnergyLevel } from "@/constants/breedData";
import type { Pet, PetLifestyle, CafePref } from "@/types/database";

export interface ScoreBreakdown {
  energy: number;      // 0~20
  personality: number; // 0~20
  timeSlot: number;    // 0~25
  size: number;        // 0~15
  cafe: number;        // 0~20
  total: number;       // 0~100
}

function scoreEnergy(a: Pet, b: Pet): number {
  const ea = getEnergyLevel(a.breed);
  const eb = getEnergyLevel(b.breed);
  if (ea === eb) return 20;
  const levels = ["LOW", "MEDIUM", "HIGH"];
  const diff = Math.abs(levels.indexOf(ea) - levels.indexOf(eb));
  return diff === 1 ? 10 : 0;
}

function scorePersonality(a: Pet, b: Pet): number {
  if (a.personality_tags.length === 0 && b.personality_tags.length === 0) return 10;
  const setA = new Set(a.personality_tags);
  const shared = b.personality_tags.filter((t) => setA.has(t)).length;
  const maxLen = Math.max(a.personality_tags.length, b.personality_tags.length);
  return maxLen === 0 ? 10 : Math.round((shared / maxLen) * 20);
}

function scoreTimeSlot(a: PetLifestyle | null, b: PetLifestyle | null): number {
  if (!a || !b) return 12;
  const setA = new Set(a.walk_time_slots);
  const overlap = b.walk_time_slots.filter((h) => setA.has(h)).length;
  const minLen = Math.min(a.walk_time_slots.length, b.walk_time_slots.length);
  if (minLen === 0) return 12;
  return Math.round((overlap / minLen) * 25);
}

function sizeCategory(kg: number | null): number {
  if (kg === null) return 1;
  if (kg < 5) return 0;
  if (kg < 15) return 1;
  return 2;
}

function scoreSize(a: Pet, b: Pet): number {
  const diff = Math.abs(sizeCategory(a.weight_kg) - sizeCategory(b.weight_kg));
  if (diff === 0) return 15;
  if (diff === 1) return 8;
  return 0;
}

function scoreCafe(a: PetLifestyle | null, b: PetLifestyle | null): number {
  if (!a || !b) return 10;
  const map: Record<CafePref, number> = { LOVES: 2, OK: 1, NO: 0 };
  const diff = Math.abs(map[a.cafe_pref] - map[b.cafe_pref]);
  if (diff === 0) return 20;
  if (diff === 1) return 10;
  return 0;
}

export function calculateCompatibility(
  myPet: Pet,
  myLifestyle: PetLifestyle | null,
  theirPet: Pet,
  theirLifestyle: PetLifestyle | null,
): ScoreBreakdown {
  const energy      = scoreEnergy(myPet, theirPet);
  const personality = scorePersonality(myPet, theirPet);
  const timeSlot    = scoreTimeSlot(myLifestyle, theirLifestyle);
  const size        = scoreSize(myPet, theirPet);
  const cafe        = scoreCafe(myLifestyle, theirLifestyle);
  const total       = energy + personality + timeSlot + size + cafe;
  return { energy, personality, timeSlot, size, cafe, total };
}
