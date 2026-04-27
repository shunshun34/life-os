create table if not exists user_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) unique,
  wake_up_time text default '06:55',
  sleep_time text default '00:00',
  sleep_rule text default '23:30以降は作業しない（強制終了）',
  breakfast_rule text default 'ご飯200〜250g＋納豆＋味噌汁＋卵＋プロテイン',
  lunch_rule text default 'おにぎり2個＋タンパク質（チキン or ツナ等）',
  dinner_rule text default 'ご飯最大300g＋タンパク質中心・腹8分',
  diet_control_rule text default '揚げ物・高脂質は週2まで、連続は禁止',
  water_rule text default '2000ml',
  commute_rule text default '英語 or AWS（インプット）',
  lunch_break_rule text default '復習（軽め）',
  extra_rules text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_rules enable row level security;

drop policy if exists "user_rules_select" on user_rules;
drop policy if exists "user_rules_insert" on user_rules;
drop policy if exists "user_rules_update" on user_rules;
drop policy if exists "user_rules_delete" on user_rules;

create policy "user_rules_select"
on user_rules for select
using (auth.uid() = user_id);

create policy "user_rules_insert"
on user_rules for insert
with check (auth.uid() = user_id);

create policy "user_rules_update"
on user_rules for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_rules_delete"
on user_rules for delete
using (auth.uid() = user_id);
