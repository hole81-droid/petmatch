export type Species = "DOG" | "CAT" | "OTHER";
export type PetGender = "MALE" | "FEMALE" | "NEUTERED";
export type SwipeAction = "LIKE" | "PASS" | "SUPER_LIKE";
export type CafePref = "LOVES" | "OK" | "NO";
export type Friendliness = "HIGH" | "MED" | "LOW";
export type ApptStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface User {
  id: string;
  nickname: string;
  region: string;
  bio: string;
  avatar_url: string | null;
  purpose_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: Species;
  breed: string;
  age_years: number;
  gender: PetGender;
  weight_kg: number | null;
  photos: string[];
  personality_tags: string[];
  is_vaccinated: boolean;
  is_neutered: boolean;
  needs_muzzle: boolean;
  dog_friendly: Friendliness;
  human_friendly: Friendliness;
  is_active: boolean;
  created_at: string;
}

export interface FavoriteLocation {
  name: string;
  radius_m: number;
}

export interface PetLifestyle {
  id: string;
  pet_id: string;
  walk_time_slots: number[];
  walk_days: number[];
  favorite_locations: FavoriteLocation[];
  cafe_pref: CafePref;
  place_type_tags: string[];
  updated_at: string;
}

export interface Swipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  action: SwipeAction;
  created_at: string;
}

export interface Match {
  id: string;
  pet1_id: string;
  pet2_id: string;
  matched_at: string;
  safety_check_done: boolean;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  match_id: string;
  scheduled_at: string;
  location_name: string;
  status: ApptStatus;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  created_at: string;
}

// Supabase client generic용 (추후 supabase gen types로 교체 가능)
export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User> & { id: string }; Update: Partial<User> };
      pets: { Row: Pet; Insert: Omit<Pet, "id" | "created_at">; Update: Partial<Pet> };
      pet_lifestyles: { Row: PetLifestyle; Insert: Omit<PetLifestyle, "id" | "updated_at">; Update: Partial<PetLifestyle> };
      swipes: { Row: Swipe; Insert: Omit<Swipe, "id" | "created_at">; Update: Partial<Swipe> };
      matches: { Row: Match; Insert: Omit<Match, "id" | "matched_at">; Update: Partial<Match> };
      messages: { Row: Message; Insert: Omit<Message, "id" | "created_at">; Update: Partial<Message> };
      appointments: { Row: Appointment; Insert: Omit<Appointment, "id" | "created_at">; Update: Partial<Appointment> };
      reports: { Row: Report; Insert: Omit<Report, "id" | "created_at">; Update: Partial<Report> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      species: Species;
      pet_gender: PetGender;
      swipe_action: SwipeAction;
      cafe_pref: CafePref;
      friendliness: Friendliness;
      appt_status: ApptStatus;
    };
  };
};
