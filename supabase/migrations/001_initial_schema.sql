create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calorie_goal integer not null,
  protein_goal numeric not null,
  carbs_goal numeric not null,
  fat_goal numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table if not exists public.user_profile_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sex text,
  age integer,
  height_cm numeric,
  activity_level text,
  goal text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text,
  name text not null,
  category text,
  serving_type text not null,
  default_serving_grams numeric,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  unique(user_id, local_id)
);

create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text,
  date date not null,
  meal_type text not null,
  food_id text,
  food_name text not null,
  quantity numeric,
  quantity_unit text,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  source text not null,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  unique(user_id, local_id)
);

create table if not exists public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text,
  date date not null,
  weight_kg numeric not null,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  unique(user_id, date)
);

create table if not exists public.sync_metadata (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  last_sync_at timestamptz,
  device_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, device_id)
);

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','user_goals','user_profile_settings','custom_foods','food_entries','weight_entries','sync_metadata'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create policy "profiles select own" on public.profiles for select using (id = auth.uid());
create policy "profiles insert own" on public.profiles for insert with check (id = auth.uid());
create policy "profiles update own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles delete own" on public.profiles for delete using (id = auth.uid());

create policy "user_goals select own" on public.user_goals for select using (user_id = auth.uid());
create policy "user_goals insert own" on public.user_goals for insert with check (user_id = auth.uid());
create policy "user_goals update own" on public.user_goals for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "user_goals delete own" on public.user_goals for delete using (user_id = auth.uid());

create policy "profile_settings select own" on public.user_profile_settings for select using (user_id = auth.uid());
create policy "profile_settings insert own" on public.user_profile_settings for insert with check (user_id = auth.uid());
create policy "profile_settings update own" on public.user_profile_settings for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "profile_settings delete own" on public.user_profile_settings for delete using (user_id = auth.uid());

create policy "custom_foods select own" on public.custom_foods for select using (user_id = auth.uid());
create policy "custom_foods insert own" on public.custom_foods for insert with check (user_id = auth.uid());
create policy "custom_foods update own" on public.custom_foods for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "custom_foods delete own" on public.custom_foods for delete using (user_id = auth.uid());

create policy "food_entries select own" on public.food_entries for select using (user_id = auth.uid());
create policy "food_entries insert own" on public.food_entries for insert with check (user_id = auth.uid());
create policy "food_entries update own" on public.food_entries for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "food_entries delete own" on public.food_entries for delete using (user_id = auth.uid());

create policy "weight_entries select own" on public.weight_entries for select using (user_id = auth.uid());
create policy "weight_entries insert own" on public.weight_entries for insert with check (user_id = auth.uid());
create policy "weight_entries update own" on public.weight_entries for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "weight_entries delete own" on public.weight_entries for delete using (user_id = auth.uid());

create policy "sync_metadata select own" on public.sync_metadata for select using (user_id = auth.uid());
create policy "sync_metadata insert own" on public.sync_metadata for insert with check (user_id = auth.uid());
create policy "sync_metadata update own" on public.sync_metadata for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sync_metadata delete own" on public.sync_metadata for delete using (user_id = auth.uid());
