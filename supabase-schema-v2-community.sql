-- ═══════════════════════════════════════════════════════════
-- MealMate — Erweitertes Schema (Community + Auth)
-- Führe dies NACH dem initialen Schema aus (oder komplett neu)
-- ═══════════════════════════════════════════════════════════

-- Voraussetzung: Supabase Auth ist aktiviert (standardmäßig der Fall)

-- ─────────────────────────────────────────────
-- USER PROFILES (1:1 mit auth.users)
-- ─────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, display_name)
  values (
    new.id,
    -- username aus E-Mail generieren (vor dem @), ggf. mit zufälliger Zahl
    lower(split_part(new.email, '@', 1)) || '_' || floor(random() * 9000 + 1000)::text,
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────
-- RECIPES — Erweiterung
-- ─────────────────────────────────────────────

-- Neue Spalten zu recipes hinzufügen
alter table recipes
  add column if not exists is_public boolean default false,
  add column if not exists slug text unique,
  add column if not exists cover_emoji text default '🍽️',
  add column if not exists like_count integer default 0,
  add column if not exists comment_count integer default 0;

-- Slug auto-generieren (einfacher slugify)
create or replace function slugify(text) returns text as $$
  select lower(
    regexp_replace(
      regexp_replace(
        translate($1,
          'äöüÄÖÜß áàâéèêíìîóòôúùû',
          'aouAOUs aaaeeeiiiooouu'
        ),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
$$ language sql immutable;

-- Trigger: Slug beim Anlegen eines öffentlichen Rezepts setzen
create or replace function set_recipe_slug()
returns trigger as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 0;
begin
  if new.is_public = true and (new.slug is null or new.slug = '') then
    base_slug := slugify(new.title);
    final_slug := base_slug;
    -- Eindeutigkeit sicherstellen
    while exists (select 1 from recipes where slug = final_slug and id != new.id) loop
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    end loop;
    new.slug := final_slug;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists recipes_set_slug on recipes;
create trigger recipes_set_slug
  before insert or update on recipes
  for each row execute function set_recipe_slug();

-- ─────────────────────────────────────────────
-- LIKES
-- ─────────────────────────────────────────────
create table if not exists recipe_likes (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(recipe_id, user_id)
);

-- Denormalisierter like_count auf recipes aktuell halten
create or replace function update_like_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update recipes set like_count = like_count + 1 where id = new.recipe_id;
  elsif TG_OP = 'DELETE' then
    update recipes set like_count = greatest(like_count - 1, 0) where id = old.recipe_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists recipe_likes_count on recipe_likes;
create trigger recipe_likes_count
  after insert or delete on recipe_likes
  for each row execute function update_like_count();

-- ─────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────
create table if not exists recipe_comments (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Denormalisierter comment_count
create or replace function update_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update recipes set comment_count = comment_count + 1 where id = new.recipe_id;
  elsif TG_OP = 'DELETE' then
    update recipes set comment_count = greatest(comment_count - 1, 0) where id = old.recipe_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists recipe_comments_count on recipe_comments;
create trigger recipe_comments_count
  after insert or delete on recipe_comments
  for each row execute function update_comment_count();

create trigger recipe_comments_updated_at before update on recipe_comments
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
create index if not exists recipes_is_public on recipes(is_public) where is_public = true;
create index if not exists recipes_slug on recipes(slug) where slug is not null;
create index if not exists recipes_user_id on recipes(user_id);
create index if not exists recipe_likes_recipe on recipe_likes(recipe_id);
create index if not exists recipe_likes_user on recipe_likes(user_id);
create index if not exists recipe_comments_recipe on recipe_comments(recipe_id);
create index if not exists profiles_username on profiles(username);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

-- Profiles
alter table profiles enable row level security;
create policy "profiles_public_read" on profiles for select using (true);
create policy "profiles_own_update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Recipes: öffentliche sichtbar für alle, eigene immer
drop policy if exists "public_all_recipes" on recipes;
create policy "recipes_public_read" on recipes
  for select using (is_public = true or auth.uid() = user_id);
create policy "recipes_own_insert" on recipes
  for insert with check (auth.uid() = user_id);
create policy "recipes_own_update" on recipes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recipes_own_delete" on recipes
  for delete using (auth.uid() = user_id);

-- Ingredients: lesbar wenn Rezept lesbar
drop policy if exists "public_all_ingredients" on ingredients;
create policy "ingredients_read" on ingredients for select
  using (exists (
    select 1 from recipes r where r.id = recipe_id
    and (r.is_public = true or r.user_id = auth.uid())
  ));
create policy "ingredients_own_write" on ingredients for all
  using (exists (select 1 from recipes r where r.id = recipe_id and r.user_id = auth.uid()))
  with check (exists (select 1 from recipes r where r.id = recipe_id and r.user_id = auth.uid()));

-- Recipe Steps: gleiche Logik
drop policy if exists "public_all_recipe_steps" on recipe_steps;
create policy "steps_read" on recipe_steps for select
  using (exists (
    select 1 from recipes r where r.id = recipe_id
    and (r.is_public = true or r.user_id = auth.uid())
  ));
create policy "steps_own_write" on recipe_steps for all
  using (exists (select 1 from recipes r where r.id = recipe_id and r.user_id = auth.uid()))
  with check (exists (select 1 from recipes r where r.id = recipe_id and r.user_id = auth.uid()));

-- Plan entries: nur eigene
drop policy if exists "public_all_plan_entries" on plan_entries;
create policy "plan_entries_own" on plan_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Shopping list: nur eigene
drop policy if exists "public_all_shopping_list_items" on shopping_list_items;
create policy "shopping_own" on shopping_list_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Likes: lesen für alle, schreiben nur eigene
alter table recipe_likes enable row level security;
create policy "likes_read" on recipe_likes for select using (true);
create policy "likes_own_write" on recipe_likes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Comments: öffentliche lesbar für alle, schreiben nur eigene
alter table recipe_comments enable row level security;
create policy "comments_read" on recipe_comments for select using (true);
create policy "comments_own_insert" on recipe_comments for insert
  with check (auth.uid() = user_id);
create policy "comments_own_delete" on recipe_comments for delete
  using (auth.uid() = user_id);
