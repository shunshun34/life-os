-- Life OS: ①〜④を運用段階へ持っていくための最終整理 SQL
-- 目的:
-- 1) 既存テーブルの運用性を上げる
-- 2) 分析ビューを作る
-- 3) RLS / index / storage を整理する
-- 4) 以後は「運用＋軽い改善」に寄せる

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 0. updated_at 自動更新
-- ------------------------------------------------------------
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 1. 運用上大事な index
-- ------------------------------------------------------------
create index if not exists idx_records_user_date on public.records(user_id, date desc);
create index if not exists idx_money_entries_user_date on public.money_entries(user_id, entry_date desc);
create index if not exists idx_notes_user_created on public.notes(user_id, created_at desc);
create index if not exists idx_growth_logs_user_date on public.growth_logs(user_id, log_date desc, created_at desc);
create index if not exists idx_trips_user_date on public.trips(user_id, trip_date desc, created_at desc);
create index if not exists idx_trip_photos_trip on public.trip_photos(trip_id, created_at desc);
create index if not exists idx_household_tasks_user_done on public.household_tasks(user_id, done, due_date);
create index if not exists idx_shopping_items_user_done on public.shopping_items(user_id, done, created_at desc);
create index if not exists idx_grooming_logs_user_date on public.grooming_logs(user_id, log_date desc);
create index if not exists idx_shared_memos_user_created on public.shared_memos(user_id, created_at desc);
create index if not exists idx_living_prep_tasks_user_done on public.living_prep_tasks(user_id, done, due_date);
create index if not exists idx_daily_reflections_user_date on public.daily_reflections(user_id, reflection_date desc);
create index if not exists idx_hobbies_user_created on public.hobbies(user_id, created_at desc);
create index if not exists idx_drink_reviews_user_created on public.drink_reviews(user_id, created_at desc);
create index if not exists idx_holo_profiles_user on public.holo_profiles(user_id);
create index if not exists idx_holo_favorites_user_created on public.holo_favorites(user_id, created_at desc);
create index if not exists idx_holo_activity_logs_user_created on public.holo_activity_logs(user_id, created_at desc);
create index if not exists idx_holo_watchlist_user_created on public.holo_watchlist(user_id, created_at desc);
create index if not exists idx_holo_highlights_user_created on public.holo_highlights(user_id, created_at desc);

-- ------------------------------------------------------------
-- 2. 最低限の check を追加
-- ------------------------------------------------------------
alter table if exists public.money_entries
  add constraint money_entries_amount_positive check (amount >= 0) not valid;
alter table if exists public.records
  add constraint records_weight_reasonable check (weight is null or (weight >= 20 and weight <= 300)) not valid;
alter table if exists public.records
  add constraint records_sleep_reasonable check (sleep is null or (sleep >= 0 and sleep <= 24)) not valid;
alter table if exists public.records
  add constraint records_study_reasonable check (study is null or (study >= 0 and study <= 24)) not valid;

-- ------------------------------------------------------------
-- 3. updated_at を持つテーブルを安定化
-- ------------------------------------------------------------
alter table if exists public.goals add column if not exists updated_at timestamptz default now();
alter table if exists public.wallpaper_settings add column if not exists updated_at timestamptz default now();
alter table if exists public.holo_profiles add column if not exists updated_at timestamptz default now();

drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at
before update on public.goals
for each row execute function public.set_current_timestamp_updated_at();

drop trigger if exists trg_wallpaper_settings_updated_at on public.wallpaper_settings;
create trigger trg_wallpaper_settings_updated_at
before update on public.wallpaper_settings
for each row execute function public.set_current_timestamp_updated_at();

drop trigger if exists trg_holo_profiles_updated_at on public.holo_profiles;
create trigger trg_holo_profiles_updated_at
before update on public.holo_profiles
for each row execute function public.set_current_timestamp_updated_at();

-- ------------------------------------------------------------
-- 4. RLS を強制
-- ------------------------------------------------------------
do $$
declare
  tbl text;
  tables text[] := array[
    'records','goals','notes','growth_logs','trips','trip_photos','wallpaper_settings',
    'money_entries','household_tasks','shopping_items','stock_items','grooming_logs',
    'shared_memos','living_prep_tasks','daily_reflections','hobbies','drink_reviews',
    'holo_profiles','holo_favorites','holo_activity_logs','holo_watchlist','holo_highlights'
  ];
begin
  foreach tbl in array tables
  loop
    execute format('alter table if exists public.%I enable row level security', tbl);
    execute format('alter table if exists public.%I force row level security', tbl);
  end loop;
end $$;

-- ------------------------------------------------------------
-- 5. trip-images storage bucket / policy
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('trip-images', 'trip-images', false)
on conflict (id) do nothing;

drop policy if exists "trip_images_select_own" on storage.objects;
create policy "trip_images_select_own"
on storage.objects for select
using (
  bucket_id = 'trip-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "trip_images_insert_own" on storage.objects;
create policy "trip_images_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'trip-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "trip_images_update_own" on storage.objects;
create policy "trip_images_update_own"
on storage.objects for update
using (
  bucket_id = 'trip-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'trip-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "trip_images_delete_own" on storage.objects;
create policy "trip_images_delete_own"
on storage.objects for delete
using (
  bucket_id = 'trip-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- ------------------------------------------------------------
-- 6. 分析ビュー
-- ------------------------------------------------------------
create or replace view public.life_os_daily_metrics as
with money_daily as (
  select
    user_id,
    entry_date::date as metric_date,
    sum(case when entry_type = 'income' then amount else 0 end) as income_total,
    sum(case when entry_type = 'expense' then amount else 0 end) as expense_total,
    count(*) as money_entry_count
  from public.money_entries
  group by user_id, entry_date::date
),
reflection_daily as (
  select
    user_id,
    reflection_date::date as metric_date,
    count(*) as reflection_count
  from public.daily_reflections
  group by user_id, reflection_date::date
)
select
  r.user_id,
  r.date::date as metric_date,
  r.weight,
  r.sleep,
  r.study,
  coalesce(m.income_total, 0) as income_total,
  coalesce(m.expense_total, 0) as expense_total,
  coalesce(m.money_entry_count, 0) as money_entry_count,
  coalesce(rd.reflection_count, 0) as reflection_count,
  (coalesce(r.sleep, 0) * coalesce(r.study, 0)) as sleep_study_signal
from public.records r
left join money_daily m
  on m.user_id = r.user_id and m.metric_date = r.date::date
left join reflection_daily rd
  on rd.user_id = r.user_id and rd.metric_date = r.date::date;

create or replace view public.life_os_monthly_summary as
select
  user_id,
  date_trunc('month', metric_date)::date as month_start,
  avg(weight) as avg_weight,
  avg(sleep) as avg_sleep,
  avg(study) as avg_study,
  sum(expense_total) as total_expense,
  sum(income_total) as total_income,
  count(*) as logged_days
from public.life_os_daily_metrics
group by user_id, date_trunc('month', metric_date)::date;

create or replace function public.life_os_dashboard_snapshot(target_user uuid)
returns table (
  latest_record_date date,
  latest_weight numeric,
  latest_sleep numeric,
  latest_study numeric,
  last_30_expense numeric,
  last_30_income numeric,
  trip_count bigint,
  note_count bigint,
  reflection_count bigint
)
language sql
security definer
set search_path = public
as $$
  with latest_record as (
    select *
    from public.records
    where user_id = target_user
    order by date desc
    limit 1
  )
  select
    (select date from latest_record),
    (select weight from latest_record),
    (select sleep from latest_record),
    (select study from latest_record),
    coalesce((select sum(amount) from public.money_entries where user_id = target_user and entry_type = 'expense' and entry_date >= current_date - interval '30 day'), 0),
    coalesce((select sum(amount) from public.money_entries where user_id = target_user and entry_type = 'income' and entry_date >= current_date - interval '30 day'), 0),
    coalesce((select count(*) from public.trips where user_id = target_user), 0),
    coalesce((select count(*) from public.notes where user_id = target_user), 0),
    coalesce((select count(*) from public.daily_reflections where user_id = target_user), 0);
$$;

revoke all on function public.life_os_dashboard_snapshot(uuid) from public;
grant execute on function public.life_os_dashboard_snapshot(uuid) to authenticated;

-- ------------------------------------------------------------
-- 7. 運用用メモ
-- ------------------------------------------------------------
comment on view public.life_os_daily_metrics is 'Life OS の日次分析用ビュー';
comment on view public.life_os_monthly_summary is 'Life OS の月次分析用ビュー';
comment on function public.life_os_dashboard_snapshot(uuid) is 'ダッシュボード用の軽量サマリ';

-- ------------------------------------------------------------
-- 8. signup 停止は SQL ではなく Supabase Dashboard で実施
-- Authentication > Providers > Email > Confirm email / Signups を確認
-- 自分専用なら Signups disabled にする
-- ------------------------------------------------------------
