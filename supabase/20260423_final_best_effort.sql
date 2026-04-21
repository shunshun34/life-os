alter table notes add column if not exists tags text[] default '{}';
alter table notes add column if not exists visibility text default 'private';

alter table growth_logs add column if not exists tags text[] default '{}';
alter table growth_logs add column if not exists visibility text default 'private';
alter table growth_logs add column if not exists log_date date default current_date;

alter table trips add column if not exists visibility text default 'private';
alter table trips add column if not exists prefecture text;
alter table trips add column if not exists title text;
alter table trips add column if not exists memo text;
alter table trips add column if not exists trip_date date;
alter table trips add column if not exists shared_with text;

create table if not exists trip_photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  storage_path text not null,
  created_at timestamptz default now()
);

alter table trip_photos enable row level security;
drop policy if exists own_select_trip_photos on trip_photos;
create policy own_select_trip_photos on trip_photos for select using (auth.uid() = user_id);
drop policy if exists own_insert_trip_photos on trip_photos;
create policy own_insert_trip_photos on trip_photos for insert with check (auth.uid() = user_id);
drop policy if exists own_update_trip_photos on trip_photos;
create policy own_update_trip_photos on trip_photos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_trip_photos on trip_photos;
create policy own_delete_trip_photos on trip_photos for delete using (auth.uid() = user_id);

create table if not exists money_entries (
  id uuid primary key default gen_random_uuid(),
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
drop policy if exists own_select_money_entries on money_entries;
create policy own_select_money_entries on money_entries for select using (auth.uid() = user_id);
drop policy if exists own_insert_money_entries on money_entries;
create policy own_insert_money_entries on money_entries for insert with check (auth.uid() = user_id);
drop policy if exists own_update_money_entries on money_entries;
create policy own_update_money_entries on money_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_money_entries on money_entries;
create policy own_delete_money_entries on money_entries for delete using (auth.uid() = user_id);

create table if not exists household_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  frequency text,
  due_date date,
  done boolean default false,
  visibility text default 'private',
  created_at timestamptz default now()
);

create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  quantity text,
  done boolean default false,
  visibility text default 'partner',
  created_at timestamptz default now()
);

alter table household_tasks enable row level security;
alter table shopping_items enable row level security;

drop policy if exists own_select_household_tasks on household_tasks;
create policy own_select_household_tasks on household_tasks for select using (auth.uid() = user_id);
drop policy if exists own_insert_household_tasks on household_tasks;
create policy own_insert_household_tasks on household_tasks for insert with check (auth.uid() = user_id);
drop policy if exists own_update_household_tasks on household_tasks;
create policy own_update_household_tasks on household_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_household_tasks on household_tasks;
create policy own_delete_household_tasks on household_tasks for delete using (auth.uid() = user_id);

drop policy if exists own_select_shopping_items on shopping_items;
create policy own_select_shopping_items on shopping_items for select using (auth.uid() = user_id);
drop policy if exists own_insert_shopping_items on shopping_items;
create policy own_insert_shopping_items on shopping_items for insert with check (auth.uid() = user_id);
drop policy if exists own_update_shopping_items on shopping_items;
create policy own_update_shopping_items on shopping_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists own_delete_shopping_items on shopping_items;
create policy own_delete_shopping_items on shopping_items for delete using (auth.uid() = user_id);
