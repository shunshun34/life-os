-- Fix RLS for interpersonal_logs so authenticated users can manage their own rows.
-- Run this in Supabase SQL editor before using the Interpersonal tab.

alter table if exists interpersonal_logs enable row level security;

drop policy if exists "interpersonal_logs_policy" on interpersonal_logs;
drop policy if exists "interpersonal_logs_select_policy" on interpersonal_logs;
drop policy if exists "interpersonal_logs_insert_policy" on interpersonal_logs;
drop policy if exists "interpersonal_logs_update_policy" on interpersonal_logs;
drop policy if exists "interpersonal_logs_delete_policy" on interpersonal_logs;

create policy "interpersonal_logs_select_policy"
on interpersonal_logs
for select
using (auth.uid() = user_id);

create policy "interpersonal_logs_insert_policy"
on interpersonal_logs
for insert
with check (auth.uid() = user_id);

create policy "interpersonal_logs_update_policy"
on interpersonal_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "interpersonal_logs_delete_policy"
on interpersonal_logs
for delete
using (auth.uid() = user_id);

create unique index if not exists interpersonal_logs_user_date_unique
on interpersonal_logs(user_id, date);
