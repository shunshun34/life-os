insert into storage.buckets (id, name, public)
values ('wallpaper-images', 'wallpaper-images', false)
on conflict (id) do nothing;

create policy if not exists "wallpaper images select own"
on storage.objects for select
using (bucket_id = 'wallpaper-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy if not exists "wallpaper images insert own"
on storage.objects for insert
with check (bucket_id = 'wallpaper-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy if not exists "wallpaper images update own"
on storage.objects for update
using (bucket_id = 'wallpaper-images' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'wallpaper-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy if not exists "wallpaper images delete own"
on storage.objects for delete
using (bucket_id = 'wallpaper-images' and auth.uid()::text = (storage.foldername(name))[1]);
