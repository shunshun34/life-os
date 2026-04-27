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

-- 追加ルール用：画面上から登録・編集・削除できる自由項目
create table if not exists user_rule_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  category text not null default '任意',
  title text not null,
  body text not null,
  sort_order integer not null default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_rule_items enable row level security;

create index if not exists user_rule_items_user_id_idx on user_rule_items(user_id);
create index if not exists user_rule_items_user_category_idx on user_rule_items(user_id, category, sort_order);

drop policy if exists "user_rule_items_select" on user_rule_items;
drop policy if exists "user_rule_items_insert" on user_rule_items;
drop policy if exists "user_rule_items_update" on user_rule_items;
drop policy if exists "user_rule_items_delete" on user_rule_items;

create policy "user_rule_items_select"
on user_rule_items for select
using (auth.uid() = user_id);

create policy "user_rule_items_insert"
on user_rule_items for insert
with check (auth.uid() = user_id);

create policy "user_rule_items_update"
on user_rule_items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_rule_items_delete"
on user_rule_items for delete
using (auth.uid() = user_id);
