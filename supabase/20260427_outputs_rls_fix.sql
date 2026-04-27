-- Fix outputs table RLS for Life OS Ver.5
-- Run this in Supabase SQL Editor if saving 成果物 fails with:
-- "new row violates row-level security policy for table \"outputs\""

alter table if exists outputs enable row level security;

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'outputs') then
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'outputs' and policyname = 'outputs_select_own') then
      create policy "outputs_select_own" on outputs for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'outputs' and policyname = 'outputs_insert_own') then
      create policy "outputs_insert_own" on outputs for insert with check (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'outputs' and policyname = 'outputs_update_own') then
      create policy "outputs_update_own" on outputs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'outputs' and policyname = 'outputs_delete_own') then
      create policy "outputs_delete_own" on outputs for delete using (auth.uid() = user_id);
    end if;
  end if;
end $$;
