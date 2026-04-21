create extension if not exists pgcrypto;

-- 基本
create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  weight numeric,
  sleep numeric,
  study numeric,
  memo text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  target_weight numeric,
  target_sleep numeric,
  target_study numeric,
  memo text,
  updated_at timestamptz default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text,
  body text,
  tags text[] default '{}',
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

create table if not exists growth_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  category text,
  content text,
  tags text[] default '{}',
  visibility text default 'private' check (visibility in ('private','partner','public')),
  log_date date default current_date,
  created_at timestamptz default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  prefecture text,
  title text,
  memo text,
  trip_date date,
  shared_with text,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

create table if not exists trip_photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  storage_path text not null,
  created_at timestamptz default now()
);

create table if not exists wallpaper_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  preset text default 'aurora',
  custom_path text,
  opacity_percent int default 45,
  updated_at timestamptz default now()
);

-- 振り返り
create table if not exists daily_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  reflection_date date default current_date,
  today_win text,
  today_issue text,
  next_action text,
  created_at timestamptz default now(),
  unique(user_id, reflection_date)
);

-- お金
create table if not exists money_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  entry_type text not null check (entry_type in ('income','expense')),
  category text not null,
  title text,
  amount numeric not null,
  memo text,
  entry_date date default current_date,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

create table if not exists monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  budget_month text not null,
  category text not null,
  budget_amount numeric not null,
  created_at timestamptz default now(),
  unique(user_id, budget_month, category)
);

-- 生活管理
create table if not exists household_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  frequency text,
  due_date date,
  done boolean default false,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  quantity text,
  done boolean default false,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

create table if not exists stock_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  current_count int default 0,
  threshold_count int default 1,
  memo text,
  created_at timestamptz default now()
);

-- 身だしなみ
create table if not exists grooming_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  category text not null,
  title text not null,
  memo text,
  log_date date default current_date,
  created_at timestamptz default now()
);

-- 共有 / 暮らし
create table if not exists shared_memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text,
  body text,
  visibility text default 'partner' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

create table if not exists living_prep_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  category text,
  title text not null,
  memo text,
  done boolean default false,
  due_date date,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

-- 趣味
create table if not exists hobbies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  category text,
  memo text,
  best_point text,
  bad_point text,
  satisfaction int default 4,
  repeat_score int default 4,
  memory_score int default 4,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

create table if not exists drink_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  type text,
  place text,
  memo text,
  satisfaction int default 4,
  repeat_score int default 4,
  memory_score int default 4,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

-- ホロ活
create table if not exists holo_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  holo_name text,
  fan_since text,
  favorite_member text,
  oshi_intro text,
  favorite_points text,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists holo_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  member_name text not null,
  favorite_level text not null,
  reason text,
  charm_points text,
  recent_heat int default 3,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

create table if not exists holo_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  content_type text not null,
  member_name text,
  watched_on date,
  url text,
  memo text,
  best_point text,
  emo_score int default 3,
  laugh_score int default 3,
  healing_score int default 3,
  rewatch_score int default 3,
  is_train_friendly boolean default false,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

create table if not exists holo_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  member_name text,
  content_type text,
  url text,
  priority text default '中',
  duration_minutes int,
  mood_tag text,
  is_train_friendly boolean default false,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

create table if not exists holo_highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  member_name text,
  category text,
  memo text,
  url text,
  favorite_score int default 4,
  is_train_friendly boolean default false,
  visibility text default 'private' check (visibility in ('private','partner','public')),
  created_at timestamptz default now()
);

-- RLS
do $$
declare
  tbl text;
begin
  for tbl in
    select unnest(array[
      'records','goals','notes','growth_logs','trips','trip_photos','wallpaper_settings',
      'daily_reflections','money_entries','monthly_budgets','household_tasks','shopping_items',
      'stock_items','grooming_logs','shared_memos','living_prep_tasks',
      'hobbies','drink_reviews','holo_profiles','holo_favorites','holo_activity_logs',
      'holo_watchlist','holo_highlights'
    ])
  loop
    execute format('alter table %I enable row level security', tbl);
  end loop;
end $$;

-- generic policies
drop policy if exists own_select_records on records;
create policy own_select_records on records for select using (auth.uid() = user_id);
drop policy if exists own_insert_records on records;
create policy own_insert_records on records for insert with check (auth.uid() = user_id);
drop policy if exists own_update_records on records;
create policy own_update_records on records for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_records on records;
create policy own_delete_records on records for delete using (auth.uid() = user_id);

drop policy if exists own_select_goals on goals;
create policy own_select_goals on goals for select using (auth.uid() = user_id);
drop policy if exists own_insert_goals on goals;
create policy own_insert_goals on goals for insert with check (auth.uid() = user_id);
drop policy if exists own_update_goals on goals;
create policy own_update_goals on goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_goals on goals;
create policy own_delete_goals on goals for delete using (auth.uid() = user_id);

-- Repeat for remaining tables
do $$
declare
  tbl text;
begin
  for tbl in
    select unnest(array[
      'notes','growth_logs','trips','trip_photos','wallpaper_settings',
      'daily_reflections','money_entries','monthly_budgets','household_tasks','shopping_items',
      'stock_items','grooming_logs','shared_memos','living_prep_tasks',
      'hobbies','drink_reviews','holo_profiles','holo_favorites','holo_activity_logs',
      'holo_watchlist','holo_highlights'
    ])
  loop
    execute format('drop policy if exists own_select_%1$s on %1$s', tbl);
    execute format('create policy own_select_%1$s on %1$s for select using (auth.uid() = user_id)', tbl);
    execute format('drop policy if exists own_insert_%1$s on %1$s', tbl);
    execute format('create policy own_insert_%1$s on %1$s for insert with check (auth.uid() = user_id)', tbl);
    execute format('drop policy if exists own_update_%1$s on %1$s', tbl);
    execute format('create policy own_update_%1$s on %1$s for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', tbl);
    execute format('drop policy if exists own_delete_%1$s on %1$s', tbl);
    execute format('create policy own_delete_%1$s on %1$s for delete using (auth.uid() = user_id)', tbl);
  end loop;
end $$;