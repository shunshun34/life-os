-- Life OS Ver.5 small adjustments
-- 1) お金タブを「都度メモ」運用にするための明細テーブル
create extension if not exists "uuid-ossp";

create table if not exists money_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  entry_type text not null check (entry_type in ('income','expense')),
  category text not null,
  title text,
  amount numeric not null,
  memo text,
  entry_date date default current_date,
  visibility text default 'private',
  created_at timestamptz default now()
);

alter table money_entries enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='money_entries' and policyname='money_entries_policy') then
    create policy "money_entries_policy" on money_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_money_entries_user_date on money_entries(user_id, entry_date desc);
