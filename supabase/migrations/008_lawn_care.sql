-- Lawn Care Schema
-- Adds tables for lawn management feature

-- Lawns table (one lawn per user for now)
create table lawns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  size text not null check (size in ('small', 'medium', 'large')),
  size_sqm int,
  primary_use text not null check (primary_use in ('ornamental', 'family', 'heavy_traffic', 'shade', 'wildflower')),
  grass_type text not null,
  soil_type text not null check (soil_type in ('clay', 'sandy', 'loam', 'chalky', 'unknown')),
  current_condition text not null check (current_condition in ('excellent', 'good', 'needs_work', 'starting_fresh')),
  health_status text not null check (health_status in ('healthy', 'needs_attention', 'struggling')) default 'healthy',
  care_goal text not null check (care_goal in ('low_maintenance', 'pristine', 'family_friendly', 'wildlife')),
  known_issues text[] default '{}',
  notes text,
  ai_care_profile jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Lawn task history table (user actions on lawn tasks)
create table lawn_task_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  lawn_id uuid references lawns(id) on delete cascade not null,
  task_key text not null,
  action text not null check (action in ('done', 'skipped', 'snoozed')),
  snooze_until date,
  notes text,
  created_at timestamptz default now() not null
);

-- Lawn mowing log table
create table lawn_mowing_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  lawn_id uuid references lawns(id) on delete cascade not null,
  mowed_at timestamptz default now() not null,
  height_mm int,
  notes text,
  created_at timestamptz default now() not null
);

-- Lawn health checks table
create table lawn_health_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  lawn_id uuid references lawns(id) on delete cascade not null,
  health_status text not null check (health_status in ('healthy', 'needs_attention', 'struggling')),
  issues_reported text[] default '{}',
  season text not null check (season in ('spring', 'summer', 'autumn', 'winter')),
  notes text,
  created_at timestamptz default now() not null
);

-- Indexes for performance
create index idx_lawns_user on lawns(user_id);
create index idx_lawn_task_history_user on lawn_task_history(user_id);
create index idx_lawn_task_history_lawn on lawn_task_history(lawn_id);
create index idx_lawn_task_history_task_key on lawn_task_history(task_key);
create index idx_lawn_task_history_created on lawn_task_history(created_at desc);
create index idx_lawn_mowing_log_lawn on lawn_mowing_log(lawn_id);
create index idx_lawn_mowing_log_mowed_at on lawn_mowing_log(mowed_at desc);
create index idx_lawn_health_checks_lawn on lawn_health_checks(lawn_id);
create index idx_lawn_health_checks_created on lawn_health_checks(created_at desc);

-- Enable RLS on all lawn tables
alter table lawns enable row level security;
alter table lawn_task_history enable row level security;
alter table lawn_mowing_log enable row level security;
alter table lawn_health_checks enable row level security;

-- Lawns: users can only see/edit their own lawn
create policy "Users can view own lawn"
  on lawns for select
  using (auth.uid() = user_id);

create policy "Users can insert own lawn"
  on lawns for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lawn"
  on lawns for update
  using (auth.uid() = user_id);

create policy "Users can delete own lawn"
  on lawns for delete
  using (auth.uid() = user_id);

-- Lawn task history: users can only see/edit their own history
create policy "Users can view own lawn task history"
  on lawn_task_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own lawn task history"
  on lawn_task_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lawn task history"
  on lawn_task_history for update
  using (auth.uid() = user_id);

create policy "Users can delete own lawn task history"
  on lawn_task_history for delete
  using (auth.uid() = user_id);

-- Lawn mowing log: users can only see/edit their own logs
create policy "Users can view own lawn mowing log"
  on lawn_mowing_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own lawn mowing log"
  on lawn_mowing_log for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lawn mowing log"
  on lawn_mowing_log for update
  using (auth.uid() = user_id);

create policy "Users can delete own lawn mowing log"
  on lawn_mowing_log for delete
  using (auth.uid() = user_id);

-- Lawn health checks: users can only see/edit their own checks
create policy "Users can view own lawn health checks"
  on lawn_health_checks for select
  using (auth.uid() = user_id);

create policy "Users can insert own lawn health checks"
  on lawn_health_checks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lawn health checks"
  on lawn_health_checks for update
  using (auth.uid() = user_id);

create policy "Users can delete own lawn health checks"
  on lawn_health_checks for delete
  using (auth.uid() = user_id);

-- Trigger to auto-update updated_at on lawns
create trigger update_lawns_updated_at
  before update on lawns
  for each row execute procedure update_updated_at_column();
