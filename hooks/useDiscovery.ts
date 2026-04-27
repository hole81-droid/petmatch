"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateCompatibility } from "@/lib/scoring/compatibility";
import type { Pet, PetLifestyle, User } from "@/types/database";
import type { ScoreBreakdown } from "@/lib/scoring/compatibility";

export interface DiscoveryPet {
  pet: Pet;
  owner: Pick<User, "id" | "nickname" | "region" | "purpose_tags">;
  lifestyle: PetLifestyle | null;
  score: ScoreBreakdown;
}

export interface DiscoveryFilters {
  species?: string;
  minAge?: number;
  maxAge?: number;
  gender?: string;
  timeSlots?: number[];
  cafePref?: string;
}

export function useDiscovery(filters: DiscoveryFilters = {}) {
  const [cards, setCards]       = useState<DiscoveryPet[]>([]);
  const [loading, setLoading]   = useState(true);
  const [myPetId, setMyPetId]   = useState<string | null>(null);

  useEffect(() => {
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // My pet + lifestyle
    const { data: myPetRow } = await supabase
      .from("pets").select("*").eq("owner_id", user.id).single();
    if (!myPetRow) { setLoading(false); return; }

    setMyPetId(myPetRow.id as string);

    const { data: myLifestyleRow } = await supabase
      .from("pet_lifestyles").select("*").eq("pet_id", myPetRow.id).single();

    // Already swiped IDs
    const { data: swipeRows } = await supabase
      .from("swipes").select("swiped_id").eq("swiper_id", myPetRow.id);
    const swipedIds = new Set((swipeRows ?? []).map((s) => s.swiped_id as string));

    // Query other pets
    let query = supabase
      .from("pets")
      .select("*, pet_lifestyles(*)")
      .eq("is_active", true)
      .neq("owner_id", user.id);

    if (filters.species)  query = query.eq("species", filters.species);
    if (filters.gender)   query = query.eq("gender", filters.gender);
    if (filters.minAge !== undefined) query = query.gte("age_years", filters.minAge);
    if (filters.maxAge !== undefined) query = query.lte("age_years", filters.maxAge);

    const { data: petRows } = await query;
    if (!petRows) { setLoading(false); return; }

    // Get owner info for each pet
    const ownerIds = [...new Set(petRows.map((p) => p.owner_id as string))];
    const { data: ownerRows } = await supabase
      .from("users")
      .select("id, nickname, region, purpose_tags")
      .in("id", ownerIds);

    const ownerMap = new Map((ownerRows ?? []).map((o) => [o.id as string, o]));

    const myPet      = myPetRow as unknown as Pet;
    const myLifestyle = myLifestyleRow as unknown as PetLifestyle | null;

    const result: DiscoveryPet[] = [];
    for (const row of petRows) {
      if (swipedIds.has(row.id as string)) continue;

      const lifestyle = (row.pet_lifestyles as unknown as PetLifestyle[] | null)?.[0] ?? null;

      // Client-side cafe filter
      if (filters.cafePref && lifestyle && lifestyle.cafe_pref !== filters.cafePref) continue;
      // Time slot overlap filter
      if (filters.timeSlots && filters.timeSlots.length > 0 && lifestyle) {
        const overlap = lifestyle.walk_time_slots.some((h: number) =>
          filters.timeSlots!.includes(h)
        );
        if (!overlap) continue;
      }

      const theirPet = row as unknown as Pet;
      const owner    = ownerMap.get(row.owner_id as string);
      if (!owner) continue;

      const score = calculateCompatibility(myPet, myLifestyle, theirPet, lifestyle);
      result.push({ pet: theirPet, owner: owner as Pick<User, "id" | "nickname" | "region" | "purpose_tags">, lifestyle, score });
    }

    // Sort by compatibility score descending
    result.sort((a, b) => b.score.total - a.score.total);
    setCards(result);
    setLoading(false);
  }

  return { cards, setCards, loading, myPetId, reload: load };
}
