-- ═══════════════════════════════════════════
-- ProPilates – Supabase Schema
-- ═══════════════════════════════════════════

-- Enums
create type pilates_method as enum ('mat','reformer','x-reformer');
create type class_type     as enum ('private','duet','group','virtual');
create type difficulty     as enum ('beginner','intermediate','advanced');
create type exercise_cat   as enum ('warmup','strength','flexibility','balance','cooldown','flow','cardio');
create type tier_level     as enum ('free','premium');
create type verification_provider as enum ('basi','stott','balanced_body','polestar','other');

-- ── Instructors ──
create table instructors (
  id                uuid primary key default gen_random_uuid(),
  xion_address      text unique,
  name              text not null default '',
  bio               text not null default '',
  avatar_url        text,
  location          text not null default '',
  languages         text[] not null default '{}',
  methods           pilates_method[] not null default '{}',
  class_types       class_type[] not null default '{}',
  equipment         text[] not null default '{}',
  certifications    text[] not null default '{}',
  music_style       text not null default '',
  favorite_artists  text[] not null default '{}',
  tier              tier_level not null default 'free',
  onboarding_complete boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Exercises (seeded) ──
create table exercises (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  method            pilates_method not null,
  category          exercise_cat not null,
  difficulty        difficulty not null,
  muscle_groups     text[] not null default '{}',
  description       text not null default '',
  cues              text[] not null default '{}',
  default_duration  int not null default 45,
  image_url         text,
  video_url         text
);
create index idx_exercises_method on exercises(method);
create index idx_exercises_category on exercises(category);
create index idx_exercises_difficulty on exercises(difficulty);

-- ── Classes ──
create table classes (
  id                uuid primary key default gen_random_uuid(),
  instructor_id     uuid not null references instructors(id) on delete cascade,
  title             text not null,
  description       text not null default '',
  method            pilates_method not null default 'mat',
  class_type        class_type not null default 'group',
  difficulty        difficulty not null default 'intermediate',
  duration_minutes  int not null default 55,
  is_public         boolean not null default false,
  price             numeric(12,6),
  playlist_id       uuid,
  is_template       boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index idx_classes_instructor on classes(instructor_id);
create index idx_classes_template on classes(is_template) where is_template = true;

-- ── Class Blocks ──
create table class_blocks (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  name        text not null,
  order_index int not null default 0
);
create index idx_blocks_class on class_blocks(class_id);

-- ── Block Exercises ──
create table block_exercises (
  id            uuid primary key default gen_random_uuid(),
  block_id      uuid not null references class_blocks(id) on delete cascade,
  exercise_id   uuid not null references exercises(id),
  order_index   int not null default 0,
  duration      int not null default 45,
  reps          int,
  side          text check (side in ('both','left','right')),
  notes         text not null default ''
);
create index idx_bex_block on block_exercises(block_id);

-- ── Playlists ──
create table playlists (
  id                  uuid primary key default gen_random_uuid(),
  instructor_id       uuid not null references instructors(id) on delete cascade,
  spotify_playlist_id text not null,
  name                text not null,
  image_url           text,
  tracks              jsonb not null default '[]'
);

-- ── Portfolio Access (NFT purchases) ──
create table portfolio_access (
  id              uuid primary key default gen_random_uuid(),
  buyer_address   text not null,
  seller_address  text not null,
  class_id        uuid not null references classes(id),
  token_id        text not null,
  price_paid      numeric(12,6) not null,
  purchased_at    timestamptz not null default now()
);
create index idx_pa_buyer on portfolio_access(buyer_address);

-- ── Verifications ──
create table verifications (
  id              uuid primary key default gen_random_uuid(),
  instructor_id   uuid not null references instructors(id) on delete cascade,
  provider        verification_provider not null,
  proof_hash      text not null,
  verified_at     timestamptz not null default now(),
  tx_hash         text,
  on_chain        boolean not null default false
);

-- ── Subscriptions ──
create table subscriptions (
  id              uuid primary key default gen_random_uuid(),
  instructor_id   uuid not null references instructors(id) on delete cascade,
  tier            tier_level not null default 'premium',
  started_at      timestamptz not null default now(),
  expires_at      timestamptz,
  tx_hash         text,
  payment_method  text,
  amount_usdc     numeric(10,2)
);

-- ── RLS policies ──
alter table instructors enable row level security;
alter table classes enable row level security;
alter table class_blocks enable row level security;
alter table block_exercises enable row level security;
alter table playlists enable row level security;
alter table portfolio_access enable row level security;
alter table verifications enable row level security;
alter table subscriptions enable row level security;

-- Public read for exercises
alter table exercises enable row level security;
create policy "Exercises are readable by everyone" on exercises for select using (true);

-- Public classes are readable by everyone
create policy "Public classes readable" on classes for select using (is_public = true);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_instructors_updated before update on instructors
  for each row execute function update_updated_at();
create trigger trg_classes_updated before update on classes
  for each row execute function update_updated_at();
