-- 趣味 / お酒に visibility を追加
alter table if exists hobbies add column if not exists visibility text default 'private';
alter table if exists drink_reviews add column if not exists visibility text default 'private';

alter table if exists hobbies enable row level security;
alter table if exists drink_reviews enable row level security;

drop policy if exists "hobbies_select_own" on hobbies;
drop policy if exists "hobbies_insert_own" on hobbies;
drop policy if exists "hobbies_update_own" on hobbies;
drop policy if exists "hobbies_delete_own" on hobbies;

create policy "hobbies_select_own" on hobbies for select using (auth.uid() = user_id);
create policy "hobbies_insert_own" on hobbies for insert with check (auth.uid() = user_id);
create policy "hobbies_update_own" on hobbies for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "hobbies_delete_own" on hobbies for delete using (auth.uid() = user_id);

drop policy if exists "drink_reviews_select_own" on drink_reviews;
drop policy if exists "drink_reviews_insert_own" on drink_reviews;
drop policy if exists "drink_reviews_update_own" on drink_reviews;
drop policy if exists "drink_reviews_delete_own" on drink_reviews;

create policy "drink_reviews_select_own" on drink_reviews for select using (auth.uid() = user_id);
create policy "drink_reviews_insert_own" on drink_reviews for insert with check (auth.uid() = user_id);
create policy "drink_reviews_update_own" on drink_reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "drink_reviews_delete_own" on drink_reviews for delete using (auth.uid() = user_id);
