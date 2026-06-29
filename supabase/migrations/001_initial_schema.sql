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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;

create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calorie_goal integer not null,
  protein_goal numeric not null,
  carbs_goal numeric not null,
  fat_goal numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.user_profile_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sex text,
  age integer,
  height_cm numeric,
  activity_level text,
  fitness_goal text,
  goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.user_profile_settings add column if not exists goal text;
alter table public.user_profile_settings add column if not exists fitness_goal text;

create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  serving_type text not null check (serving_type in ('per100g', 'perPiece')),
  default_serving_grams numeric,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
  food_id uuid,
  food_name text not null,
  quantity numeric,
  quantity_unit text,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  source text not null check (source in ('predefined', 'custom', 'manual')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

create table if not exists public.predefined_foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  serving_type text not null check (serving_type in ('per100g', 'perPiece')),
  default_serving_grams numeric,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  created_at timestamptz not null default now(),
  unique(name)
);

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','user_goals','user_profile_settings','custom_foods','food_entries','weight_entries','predefined_foods'] loop
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

create policy "predefined foods readable" on public.predefined_foods for select to authenticated using (true);

insert into public.predefined_foods (name, category, serving_type, default_serving_grams, calories, protein, carbs, fat) values
('Boiled egg','Protein','perPiece',50,78,6.3,0.6,5.3),('Egg white','Protein','perPiece',33,17,3.6,0.2,0.1),('Low-fat cottage cheese / posni sir','Dairy','per100g',null,82,11,3.4,2.3),('Whey protein','Protein','per100g',null,400,80,8,6),('White rice cooked','Carbs','per100g',null,130,2.7,28.2,0.3),('Brown rice cooked','Carbs','per100g',null,112,2.6,23,0.9),('Pasta cooked','Carbs','per100g',null,158,5.8,30.9,0.9),('Chicken breast','Protein','per100g',null,165,31,0,3.6),('Turkey breast','Protein','per100g',null,135,29,0,1.5),('Lean beef / junetina','Protein','per100g',null,176,26,0,8),('Tuna in water','Protein','per100g',null,116,26,0,1),('Salmon','Protein','per100g',null,208,20,0,13),('Greek yogurt','Dairy','per100g',null,59,10,3.6,0.4),('Skyr','Dairy','per100g',null,63,11,4,0.2),('Cucumber','Vegetable','per100g',null,15,0.7,3.6,0.1),('Tomato','Vegetable','per100g',null,18,0.9,3.9,0.2),('Lettuce','Vegetable','per100g',null,15,1.4,2.9,0.2),('Mixed salad','Vegetable','per100g',null,20,1.1,4,0.2),('Green beans / mahune','Vegetable','per100g',null,35,1.9,7.9,0.3),('Broccoli','Vegetable','per100g',null,35,2.4,7.2,0.4),('Zucchini','Vegetable','per100g',null,17,1.2,3.1,0.3),('Potato cooked','Carbs','per100g',null,87,1.9,20.1,0.1),('Sweet potato','Carbs','per100g',null,86,1.6,20.1,0.1),('Oats','Carbs','per100g',null,389,16.9,66.3,6.9),('Banana','Fruit','per100g',null,89,1.1,22.8,0.3),('Apple','Fruit','per100g',null,52,0.3,13.8,0.2),('Olive oil','Fat','per100g',null,884,0,0,100),('Avocado','Fat','per100g',null,160,2,8.5,14.7)
on conflict (name) do nothing;
