-- ================================================================
-- PetMatch 데이터베이스 스키마
-- Supabase SQL Editor에 전체 복사 후 실행
-- ================================================================

-- 1. ENUM 타입 정의
create type species         as enum ('DOG', 'CAT', 'OTHER');
create type pet_gender      as enum ('MALE', 'FEMALE', 'NEUTERED');
create type swipe_action    as enum ('LIKE', 'PASS', 'SUPER_LIKE');
create type cafe_pref       as enum ('LOVES', 'OK', 'NO');
create type friendliness    as enum ('HIGH', 'MED', 'LOW');
create type appt_status     as enum ('PENDING', 'CONFIRMED', 'CANCELLED');

-- ================================================================
-- 2. 테이블 생성
-- ================================================================

-- 보호자 (auth.users 와 1:1)
create table users (
  id            uuid primary key references auth.users(id) on delete cascade,
  nickname      text not null default '',
  region        text not null default '',
  bio           text not null default '',
  avatar_url    text,
  purpose_tags  text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 반려동물
create table pets (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references users(id) on delete cascade,
  name            text not null,
  species         species not null default 'DOG',
  breed           text not null default '',
  age_years       integer not null default 0,
  gender          pet_gender not null default 'MALE',
  weight_kg       numeric(5,2),
  photos          text[] not null default '{}',
  personality_tags text[] not null default '{}',
  is_vaccinated   boolean not null default false,
  is_neutered     boolean not null default false,
  needs_muzzle    boolean not null default false,
  dog_friendly    friendliness not null default 'MED',
  human_friendly  friendliness not null default 'MED',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- 라이프스타일 (pets 와 1:1)
create table pet_lifestyles (
  id                  uuid primary key default gen_random_uuid(),
  pet_id              uuid unique not null references pets(id) on delete cascade,
  walk_time_slots     integer[] not null default '{}',
  walk_days           integer[] not null default '{}',
  favorite_locations  jsonb not null default '[]',
  cafe_pref           cafe_pref not null default 'OK',
  place_type_tags     text[] not null default '{}',
  updated_at          timestamptz not null default now()
);

-- 스와이프 기록
create table swipes (
  id          uuid primary key default gen_random_uuid(),
  swiper_id   uuid not null references pets(id) on delete cascade,
  swiped_id   uuid not null references pets(id) on delete cascade,
  action      swipe_action not null,
  created_at  timestamptz not null default now(),
  unique(swiper_id, swiped_id)
);

-- 매칭
create table matches (
  id                  uuid primary key default gen_random_uuid(),
  pet1_id             uuid not null references pets(id) on delete cascade,
  pet2_id             uuid not null references pets(id) on delete cascade,
  matched_at          timestamptz not null default now(),
  safety_check_done   boolean not null default false
);

-- 채팅 메시지
create table messages (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references matches(id) on delete cascade,
  sender_id   uuid not null references users(id) on delete cascade,
  content     text not null default '',
  image_url   text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 산책 약속
create table appointments (
  id              uuid primary key default gen_random_uuid(),
  match_id        uuid not null references matches(id) on delete cascade,
  scheduled_at    timestamptz not null,
  location_name   text not null,
  status          appt_status not null default 'PENDING',
  created_at      timestamptz not null default now()
);

-- 신고
create table reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references users(id) on delete cascade,
  reported_id   uuid not null references users(id) on delete cascade,
  reason        text not null,
  created_at    timestamptz not null default now()
);

-- ================================================================
-- 3. RLS (Row Level Security) 활성화
-- ================================================================

alter table users           enable row level security;
alter table pets            enable row level security;
alter table pet_lifestyles  enable row level security;
alter table swipes          enable row level security;
alter table matches         enable row level security;
alter table messages        enable row level security;
alter table appointments    enable row level security;
alter table reports         enable row level security;

-- ================================================================
-- 4. RLS 정책
-- ================================================================

-- users
create policy "users: 로그인 유저 전체 조회"
  on users for select using (auth.role() = 'authenticated');

create policy "users: 본인만 insert"
  on users for insert with check (id = auth.uid());

create policy "users: 본인만 update"
  on users for update using (id = auth.uid());

-- pets
create policy "pets: 활성 반려동물 조회 (본인 포함)"
  on pets for select using (is_active = true or owner_id = auth.uid());

create policy "pets: 본인만 insert"
  on pets for insert with check (owner_id = auth.uid());

create policy "pets: 본인만 update"
  on pets for update using (owner_id = auth.uid());

-- pet_lifestyles
create policy "lifestyles: 활성 반려동물 조회"
  on pet_lifestyles for select using (
    exists (
      select 1 from pets
      where pets.id = pet_id
        and (pets.is_active = true or pets.owner_id = auth.uid())
    )
  );

create policy "lifestyles: 본인 반려동물만 insert"
  on pet_lifestyles for insert with check (
    exists (select 1 from pets where pets.id = pet_id and pets.owner_id = auth.uid())
  );

create policy "lifestyles: 본인 반려동물만 update"
  on pet_lifestyles for update using (
    exists (select 1 from pets where pets.id = pet_id and pets.owner_id = auth.uid())
  );

-- swipes
create policy "swipes: 본인 스와이프 조회"
  on swipes for select using (
    exists (select 1 from pets where pets.id = swiper_id and pets.owner_id = auth.uid())
  );

create policy "swipes: 본인 반려동물만 insert"
  on swipes for insert with check (
    exists (select 1 from pets where pets.id = swiper_id and pets.owner_id = auth.uid())
  );

-- matches (내가 포함된 매칭만)
create policy "matches: 본인 포함 조회"
  on matches for select using (
    exists (select 1 from pets where pets.id = pet1_id and pets.owner_id = auth.uid())
    or exists (select 1 from pets where pets.id = pet2_id and pets.owner_id = auth.uid())
  );

create policy "matches: insert 허용 (스와이프 로직에서 생성)"
  on matches for insert with check (true);

create policy "matches: 본인 포함 update"
  on matches for update using (
    exists (select 1 from pets where pets.id = pet1_id and pets.owner_id = auth.uid())
    or exists (select 1 from pets where pets.id = pet2_id and pets.owner_id = auth.uid())
  );

-- messages
create policy "messages: 매칭 당사자만 조회"
  on messages for select using (
    exists (
      select 1 from matches
      join pets p1 on p1.id = matches.pet1_id
      join pets p2 on p2.id = matches.pet2_id
      where matches.id = match_id
        and (p1.owner_id = auth.uid() or p2.owner_id = auth.uid())
    )
  );

create policy "messages: 매칭 당사자만 insert"
  on messages for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from matches
      join pets p1 on p1.id = matches.pet1_id
      join pets p2 on p2.id = matches.pet2_id
      where matches.id = match_id
        and (p1.owner_id = auth.uid() or p2.owner_id = auth.uid())
    )
  );

create policy "messages: 읽음 처리 update"
  on messages for update using (
    exists (
      select 1 from matches
      join pets p1 on p1.id = matches.pet1_id
      join pets p2 on p2.id = matches.pet2_id
      where matches.id = match_id
        and (p1.owner_id = auth.uid() or p2.owner_id = auth.uid())
    )
  );

-- appointments
create policy "appointments: 매칭 당사자만 조회"
  on appointments for select using (
    exists (
      select 1 from matches
      join pets p1 on p1.id = matches.pet1_id
      join pets p2 on p2.id = matches.pet2_id
      where matches.id = match_id
        and (p1.owner_id = auth.uid() or p2.owner_id = auth.uid())
    )
  );

create policy "appointments: 매칭 당사자만 insert"
  on appointments for insert with check (
    exists (
      select 1 from matches
      join pets p1 on p1.id = matches.pet1_id
      join pets p2 on p2.id = matches.pet2_id
      where matches.id = match_id
        and (p1.owner_id = auth.uid() or p2.owner_id = auth.uid())
    )
  );

create policy "appointments: 매칭 당사자만 update"
  on appointments for update using (
    exists (
      select 1 from matches
      join pets p1 on p1.id = matches.pet1_id
      join pets p2 on p2.id = matches.pet2_id
      where matches.id = match_id
        and (p1.owner_id = auth.uid() or p2.owner_id = auth.uid())
    )
  );

-- reports
create policy "reports: 로그인 유저 insert"
  on reports for insert with check (reporter_id = auth.uid());

-- ================================================================
-- 5. 회원가입 자동 트리거
-- 새 유저가 auth.users 에 생성될 때 public.users 에 자동 row 생성
-- ================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
