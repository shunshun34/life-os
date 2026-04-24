-- Life OS Ver.5 required schema additions / safety patch
-- Run this in Supabase SQL Editor before using the integrated Ver.5 UI.

create extension if not exists "uuid-ossp";

create table if not exists grooming_templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  category text not null,
  item_name text not null,
  day_of_week int,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists household_templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  task_name text not null,
  day_of_week int,
  display_order int default 0,
  is_active boolean default true,
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists household_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  date date not null,
  task_name text not null,
  is_done boolean default false,
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists study_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  category text not null,
  day_of_week int,
  target_minutes int,
  content_template text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists workout_plan_items (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references workout_plans(id) on delete cascade,
  exercise_name text not null,
  default_weight numeric,
  default_reps int,
  default_sets int,
  display_order int default 0,
  created_at timestamptz default now()
);

create table if not exists output_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  output_id uuid references outputs(id) on delete cascade,
  review_date date not null,
  good_points text,
  improvements text,
  third_person_critique text,
  interview_evaluation text,
  next_action text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists money_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  month text not null,
  income numeric,
  expense numeric,
  investment numeric,
  nisa_checked boolean default false,
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, month)
);

create table if not exists user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  wake_time text,
  sleep_target_time text,
  breakfast_rule text,
  lunch_rule text,
  dinner_rule text,
  water_target_ml int default 2000,
  ai_review_template text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table grooming_templates enable row level security;
alter table household_templates enable row level security;
alter table household_logs enable row level security;
alter table study_settings enable row level security;
alter table workout_plan_items enable row level security;
alter table output_reviews enable row level security;
alter table money_logs enable row level security;
alter table user_settings enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='grooming_templates' and policyname='grooming_templates_policy') then
    create policy "grooming_templates_policy" on grooming_templates for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='household_templates' and policyname='household_templates_policy') then
    create policy "household_templates_policy" on household_templates for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='household_logs' and policyname='household_logs_policy') then
    create policy "household_logs_policy" on household_logs for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='study_settings' and policyname='study_settings_policy') then
    create policy "study_settings_policy" on study_settings for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='workout_plan_items' and policyname='workout_plan_items_policy') then
    create policy "workout_plan_items_policy" on workout_plan_items for all using (
      exists (
        select 1 from workout_plans
        where workout_plans.id = workout_plan_items.plan_id
        and workout_plans.user_id = auth.uid()
      )
    );
  end if;
  if not exists (select 1 from pg_policies where tablename='output_reviews' and policyname='output_reviews_policy') then
    create policy "output_reviews_policy" on output_reviews for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='money_logs' and policyname='money_logs_policy') then
    create policy "money_logs_policy" on money_logs for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='user_settings' and policyname='user_settings_policy') then
    create policy "user_settings_policy" on user_settings for all using (auth.uid() = user_id);
  end if;
end $$;

create unique index if not exists interpersonal_logs_user_date_unique
on interpersonal_logs(user_id, date);

create unique index if not exists output_reviews_user_output_unique
on output_reviews(user_id, output_id);
