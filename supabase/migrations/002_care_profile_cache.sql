-- Care Profile Cache Table
-- Caches AI-generated care profiles to reduce API costs
-- Version-based invalidation for future location features

create table care_profile_cache (
  id uuid primary key default gen_random_uuid(),

  -- Cache key components
  plant_name text not null,  -- Normalized type (e.g. "Hybrid Tea Rose", not "Peace Rose")
  planted_in text,  -- 'ground', 'pot', 'raised_bed'
  climate_zone int,  -- UK hardiness zones: 7, 8, 9, 10 (NULL for version 1)

  -- Cache metadata
  cache_version int not null default 1,  -- Bump when features change
  cache_key text not null unique,  -- Generated hash for fast lookup

  -- Cached data
  care_profile jsonb not null,  -- Complete AICareProfile object

  -- Performance tracking
  created_at timestamptz default now(),
  hits int default 0,  -- Number of times this cache entry was used

  -- Constraints
  constraint valid_planted_in check (planted_in in ('ground', 'pot', 'raised_bed')),
  constraint valid_climate_zone check (climate_zone is null or (climate_zone between 7 and 10))
);

-- Indexes for fast lookups
create index idx_cache_key on care_profile_cache(cache_key);
create index idx_cache_lookup on care_profile_cache(plant_name, planted_in, climate_zone, cache_version);
create index idx_cache_created on care_profile_cache(created_at desc);
create index idx_cache_hits on care_profile_cache(hits desc);  -- For analytics

-- Row Level Security
alter table care_profile_cache enable row level security;

-- Cache table is shared across all users (read-only for authenticated users)
create policy "Cache entries are readable by authenticated users"
  on care_profile_cache
  for select
  to authenticated
  using (true);

-- Only service role can insert/update cache entries
create policy "Cache entries are managed by service"
  on care_profile_cache
  for all
  to service_role
  using (true);

-- Comments for documentation
comment on table care_profile_cache is 'Caches AI-generated plant care profiles to reduce API costs. Uses versioned cache keys to support future location-based features.';
comment on column care_profile_cache.plant_name is 'Plant type (e.g., "Hybrid Tea Rose", "Cherry Tomato"), not specific cultivar';
comment on column care_profile_cache.climate_zone is 'UK USDA hardiness zone (7-10). NULL for version 1 (generic UK advice)';
comment on column care_profile_cache.cache_version is 'Cache schema version. Increment to invalidate all old caches when features change';
comment on column care_profile_cache.hits is 'Number of times this cached profile was returned. Used for cost savings analytics';
