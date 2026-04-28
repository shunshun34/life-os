-- 勉強ログ・勉強設定のRLS修正
-- Supabase SQL Editorで実行してください。

alter table if exists study_logs enable row level security;
alter table if exists study_settings enable row level security;

drop policy if exists "study_logs_policy" on study_logs;
create policy "study_logs_policy" on study_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "study_settings_policy" on study_settings;
create policy "study_settings_policy" on study_settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
