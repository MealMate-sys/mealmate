-- MealMate Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- RECIPES
-- ─────────────────────────────────────────────
create table recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,                         -- for future auth
  title text not null,
  description text,
  tags text[] default '{}',
  servings integer not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- INGREDIENTS
-- ─────────────────────────────────────────────
create table ingredients (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  name text not null,
  amount numeric not null,
  unit text not null,
  category text not null default 'Sonstiges',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- RECIPE STEPS
-- ─────────────────────────────────────────────
create table recipe_steps (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  step_number integer not null,
  description text not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- PLAN ENTRIES
-- ─────────────────────────────────────────────
create table plan_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  recipe_id uuid not null references recipes(id) on delete cascade,
  week_start date not null,             -- Monday of the week (ISO)
  day_of_week integer not null,        -- 0=Mon, 1=Tue, ..., 6=Sun
  slot text not null check (slot in ('lunch', 'dinner')),
  servings integer not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, week_start, day_of_week, slot)
);

-- ─────────────────────────────────────────────
-- SHOPPING LIST ITEMS
-- ─────────────────────────────────────────────
create table shopping_list_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  week_start date not null,
  name text not null,
  amount numeric,
  unit text,
  category text not null default 'Sonstiges',
  is_checked boolean default false,
  is_manual boolean default false,      -- true = manually added
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER (shared function)
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_updated_at before update on recipes
  for each row execute function update_updated_at();

create trigger plan_entries_updated_at before update on plan_entries
  for each row execute function update_updated_at();

create trigger shopping_list_items_updated_at before update on shopping_list_items
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
create index on ingredients(recipe_id);
create index on recipe_steps(recipe_id);
create index on plan_entries(week_start);
create index on shopping_list_items(week_start);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (prepare for auth later)
-- For now: allow all (public access)
-- ─────────────────────────────────────────────
alter table recipes enable row level security;
alter table ingredients enable row level security;
alter table recipe_steps enable row level security;
alter table plan_entries enable row level security;
alter table shopping_list_items enable row level security;

-- Permissive policies for MVP (no auth yet)
create policy "public_all_recipes" on recipes for all using (true) with check (true);
create policy "public_all_ingredients" on ingredients for all using (true) with check (true);
create policy "public_all_recipe_steps" on recipe_steps for all using (true) with check (true);
create policy "public_all_plan_entries" on plan_entries for all using (true) with check (true);
create policy "public_all_shopping_list_items" on shopping_list_items for all using (true) with check (true);
