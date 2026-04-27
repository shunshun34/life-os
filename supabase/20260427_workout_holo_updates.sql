-- 2026-04-27 筋トレタブ・ホロ活タブ修正

-- 筋トレ: 種目に部位を追加
alter table if exists public.workout_plan_items
add column if not exists body_part text;

-- ホロ活: リアル活動用の写真・メモ項目を追加
alter table if exists public.holo_activity_logs
add column if not exists image_path text;

alter table if exists public.holo_watchlist
add column if not exists memo text;

-- workout_plans RLS: 自分のデータのみCRUD
alter table if exists public.workout_plans enable row level security;
drop policy if exists "workout_plans_policy" on public.workout_plans;
drop policy if exists "Allow insert for authenticated users" on public.workout_plans;
drop policy if exists "Allow select for own data" on public.workout_plans;
drop policy if exists "Allow update for own data" on public.workout_plans;
drop policy if exists "Allow delete for own data" on public.workout_plans;
create policy "workout_plans_policy" on public.workout_plans
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- workout_logs RLS: 記録・編集・削除を許可
alter table if exists public.workout_logs enable row level security;
drop policy if exists "workout_logs_policy" on public.workout_logs;
drop policy if exists "Allow insert for authenticated users" on public.workout_logs;
drop policy if exists "Allow select for own data" on public.workout_logs;
drop policy if exists "Allow update for own data" on public.workout_logs;
drop policy if exists "Allow delete for own data" on public.workout_logs;
create policy "workout_logs_policy" on public.workout_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- workout_plan_items RLS: 親メニューの所有者のみCRUD
alter table if exists public.workout_plan_items enable row level security;
drop policy if exists "workout_plan_items_policy" on public.workout_plan_items;
create policy "workout_plan_items_policy" on public.workout_plan_items
for all
using (
  exists (
    select 1 from public.workout_plans
    where workout_plans.id = workout_plan_items.plan_id
      and workout_plans.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workout_plans
    where workout_plans.id = workout_plan_items.plan_id
      and workout_plans.user_id = auth.uid()
  )
);

-- ホロ活系RLS: 編集・削除も含めて自分のデータのみ許可
alter table if exists public.holo_favorites enable row level security;
drop policy if exists "holo_favorites_policy" on public.holo_favorites;
create policy "holo_favorites_policy" on public.holo_favorites
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table if exists public.holo_activity_logs enable row level security;
drop policy if exists "holo_activity_logs_policy" on public.holo_activity_logs;
create policy "holo_activity_logs_policy" on public.holo_activity_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table if exists public.holo_watchlist enable row level security;
drop policy if exists "holo_watchlist_policy" on public.holo_watchlist;
create policy "holo_watchlist_policy" on public.holo_watchlist
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
