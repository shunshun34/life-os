-- Moneyタブ：NISA欄の代替としてサブスク管理を追加
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount integer not null default 0,
  cycle text not null default 'monthly' check (cycle in ('monthly', 'semiannual', 'annual')),
  category text,
  memo text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view own subscriptions" on public.subscriptions;
drop policy if exists "Users can insert own subscriptions" on public.subscriptions;
drop policy if exists "Users can update own subscriptions" on public.subscriptions;
drop policy if exists "Users can delete own subscriptions" on public.subscriptions;

create policy "Users can view own subscriptions"
on public.subscriptions
for select
using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
on public.subscriptions
for insert
with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
on public.subscriptions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
on public.subscriptions
for delete
using (auth.uid() = user_id);
