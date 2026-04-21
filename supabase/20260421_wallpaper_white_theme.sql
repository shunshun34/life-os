alter table wallpaper_settings
  add column if not exists mode text default 'preset';

insert into storage.buckets (id, name, public)
values ('wallpaper-images', 'wallpaper-images', true)
on conflict (id) do nothing;

drop policy if exists "wallpaper images select own" on storage.objects;
create policy "wallpaper images select own"
on storage.objects
for select
using (bucket_id = 'wallpaper-images' and auth.uid() = owner);

drop policy if exists "wallpaper images insert own" on storage.objects;
create policy "wallpaper images insert own"
on storage.objects
for insert
with check (bucket_id = 'wallpaper-images' and auth.uid() = owner);

drop policy if exists "wallpaper images update own" on storage.objects;
create policy "wallpaper images update own"
on storage.objects
for update
using (bucket_id = 'wallpaper-images' and auth.uid() = owner)
with check (bucket_id = 'wallpaper-images' and auth.uid() = owner);

drop policy if exists "wallpaper images delete own" on storage.objects;
create policy "wallpaper images delete own"
on storage.objects
for delete
using (bucket_id = 'wallpaper-images' and auth.uid() = owner);
