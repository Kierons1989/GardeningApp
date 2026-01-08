-- Garden Brain Initial Schema
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase Auth users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null
);

-- Plants table
create table plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  common_name text,
  species text,
  plant_type text,
  area text,
  planted_in text check (planted_in in ('ground', 'pot', 'raised_bed')),
  notes text,
  photo_url text,
  ai_care_profile jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Task templates table (for future system/user templates)
create table task_templates (
  id uuid primary key default gen_random_uuid(),
  plant_type text,
  title text not null,
  category text check (category in ('pruning', 'feeding', 'pest_control', 'planting', 'watering', 'harvesting', 'winter_care', 'general')),
  month_start int check (month_start between 1 and 12),
  month_end int check (month_end between 1 and 12),
  recurrence_type text check (recurrence_type in ('once_per_window', 'weekly_in_window', 'monthly_in_window')),
  effort_level text check (effort_level in ('low', 'medium', 'high')),
  why_this_matters text,
  how_to text,
  is_system boolean default true,
  created_at timestamptz default now() not null
);

-- Task history table (user actions on tasks)
create table task_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  plant_id uuid references plants(id) on delete cascade,
  task_key text not null,
  action text not null check (action in ('done', 'skipped', 'snoozed')),
  snooze_until date,
  notes text,
  created_at timestamptz default now() not null
);

-- Indexes for performance
create index idx_plants_user on plants(user_id);
create index idx_plants_area on plants(area);
create index idx_task_history_user on task_history(user_id);
create index idx_task_history_plant on task_history(plant_id);
create index idx_task_history_task_key on task_history(task_key);
create index idx_task_history_created on task_history(created_at desc);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table plants enable row level security;
alter table task_templates enable row level security;
alter table task_history enable row level security;

-- Profiles: users can only see/edit their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Plants: users can only see/edit their own plants
create policy "Users can view own plants"
  on plants for select
  using (auth.uid() = user_id);

create policy "Users can insert own plants"
  on plants for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plants"
  on plants for update
  using (auth.uid() = user_id);

create policy "Users can delete own plants"
  on plants for delete
  using (auth.uid() = user_id);

-- Task templates: everyone can read system templates
create policy "Anyone can view system templates"
  on task_templates for select
  using (is_system = true);

-- Task history: users can only see/edit their own history
create policy "Users can view own task history"
  on task_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own task history"
  on task_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own task history"
  on task_history for update
  using (auth.uid() = user_id);

create policy "Users can delete own task history"
  on task_history for delete
  using (auth.uid() = user_id);

-- Function to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at on plants
create trigger update_plants_updated_at
  before update on plants
  for each row execute procedure update_updated_at_column();
