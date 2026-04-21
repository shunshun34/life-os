create table if not exists wallpaper_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  preset text default 'aurora',
  custom_path text,
  opacity_percent int default 45,
  updated_at timestamptz default now()
);

create table if not exists grooming_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  category text not null,
  title text not null,
  memo text,
  log_date date default current_date,
  created_at timestamptz default now()
);

create table if not exists shared_memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text,
  body text,
  visibility text default 'partner',
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
  visibility text default 'private',
  created_at timestamptz default now()
);

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

alter table wallpaper_settings enable row level security;
alter table grooming_logs enable row level security;
alter table shared_memos enable row level security;
alter table living_prep_tasks enable row level security;
alter table daily_reflections enable row level security;

drop policy if exists own_select_wallpaper_settings on wallpaper_settings;
create policy own_select_wallpaper_settings on wallpaper_settings for select using (auth.uid() = user_id);
drop policy if exists own_insert_wallpaper_settings on wallpaper_settings;
create policy own_insert_wallpaper_settings on wallpaper_settings for insert with check (auth.uid() = user_id);
drop policy if exists own_update_wallpaper_settings on wallpaper_settings;
create policy own_update_wallpaper_settings on wallpaper_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_wallpaper_settings on wallpaper_settings;
create policy own_delete_wallpaper_settings on wallpaper_settings for delete using (auth.uid() = user_id);

drop policy if exists own_select_grooming_logs on grooming_logs;
create policy own_select_grooming_logs on grooming_logs for select using (auth.uid() = user_id);
drop policy if exists own_insert_grooming_logs on grooming_logs;
create policy own_insert_grooming_logs on grooming_logs for insert with check (auth.uid() = user_id);
drop policy if exists own_update_grooming_logs on grooming_logs;
create policy own_update_grooming_logs on grooming_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_grooming_logs on grooming_logs;
create policy own_delete_grooming_logs on grooming_logs for delete using (auth.uid() = user_id);

drop policy if exists own_select_shared_memos on shared_memos;
create policy own_select_shared_memos on shared_memos for select using (auth.uid() = user_id);
drop policy if exists own_insert_shared_memos on shared_memos;
create policy own_insert_shared_memos on shared_memos for insert with check (auth.uid() = user_id);
drop policy if exists own_update_shared_memos on shared_memos;
create policy own_update_shared_memos on shared_memos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_shared_memos on shared_memos;
create policy own_delete_shared_memos on shared_memos for delete using (auth.uid() = user_id);

drop policy if exists own_select_living_prep_tasks on living_prep_tasks;
create policy own_select_living_prep_tasks on living_prep_tasks for select using (auth.uid() = user_id);
drop policy if exists own_insert_living_prep_tasks on living_prep_tasks;
create policy own_insert_living_prep_tasks on living_prep_tasks for insert with check (auth.uid() = user_id);
drop policy if exists own_update_living_prep_tasks on living_prep_tasks;
create policy own_update_living_prep_tasks on living_prep_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_living_prep_tasks on living_prep_tasks;
create policy own_delete_living_prep_tasks on living_prep_tasks for delete using (auth.uid() = user_id);

drop policy if exists own_select_daily_reflections on daily_reflections;
create policy own_select_daily_reflections on daily_reflections for select using (auth.uid() = user_id);
drop policy if exists own_insert_daily_reflections on daily_reflections;
create policy own_insert_daily_reflections on daily_reflections for insert with check (auth.uid() = user_id);
drop policy if exists own_update_daily_reflections on daily_reflections;
create policy own_update_daily_reflections on daily_reflections for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_daily_reflections on daily_reflections;
create policy own_delete_daily_reflections on daily_reflections for delete using (auth.uid() = user_id);
