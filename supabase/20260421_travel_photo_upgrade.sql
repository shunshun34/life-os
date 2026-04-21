
alter table trips
add column if not exists visibility text default 'private';

create table if not exists trip_photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  storage_path text not null,
  created_at timestamptz default now()
);

alter table trip_photos enable row level security;

drop policy if exists own_select_trip_photos on trip_photos;
create policy own_select_trip_photos
on trip_photos for select
using (auth.uid() = user_id);

drop policy if exists own_insert_trip_photos on trip_photos;
create policy own_insert_trip_photos
on trip_photos for insert
with check (auth.uid() = user_id);

drop policy if exists own_update_trip_photos on trip_photos;
create policy own_update_trip_photos
on trip_photos for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists own_delete_trip_photos on trip_photos;
create policy own_delete_trip_photos
on trip_photos for delete
using (auth.uid() = user_id);
