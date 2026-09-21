-- Migration: 20270114000000_trips_feature.sql
-- Description: Adds tables, indexes, and RLS policies for Greenflag Trips feature

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  destination text not null,
  state text default 'Karnataka',
  start_date date not null,
  end_date date not null,
  vibe text check (vibe in ('Chill', 'Trek', 'Backpacking', 'Party', 'Roadtrip', 'Workcation')) default 'Chill',
  budget_per_day integer default 1500,
  spots_available integer default 1,
  spots_total integer default 2,
  female_only boolean default false,
  description text not null,
  stay_type text default 'Hostel / Homestay',
  transport_type text default 'Bike / Car Split',
  status text check (status in ('active', 'completed', 'cancelled')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.trip_requests (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  intro_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (trip_id, applicant_id)
);

-- Indexes for lightning fast feed queries
create index if not exists idx_trips_destination on public.trips(destination);
create index if not exists idx_trips_dates on public.trips(start_date, end_date);
create index if not exists idx_trips_status on public.trips(status);
create index if not exists idx_trips_host on public.trips(host_id);
create index if not exists idx_trip_requests_trip on public.trip_requests(trip_id);
create index if not exists idx_trip_requests_applicant on public.trip_requests(applicant_id);

-- Enable RLS
alter table public.trips enable row level security;
alter table public.trip_requests enable row level security;

-- Policies for trips
create policy "Trips are viewable by authenticated users"
  on public.trips for select
  to authenticated
  using (
    status = 'active' and (
      female_only = false or
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and (profiles.persona = 'woman' or profiles.id = trips.host_id)
      )
    )
  );

create policy "Users can insert their own trips"
  on public.trips for insert
  to authenticated
  with check (host_id = auth.uid());

create policy "Hosts can update their own trips"
  on public.trips for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "Hosts can delete their own trips"
  on public.trips for delete
  to authenticated
  using (host_id = auth.uid());

-- Policies for trip_requests
create policy "Trip applicants and hosts can view requests"
  on public.trip_requests for select
  to authenticated
  using (
    applicant_id = auth.uid() or
    exists (
      select 1 from public.trips
      where trips.id = trip_requests.trip_id and trips.host_id = auth.uid()
    )
  );

create policy "Users can submit join requests"
  on public.trip_requests for insert
  to authenticated
  with check (
    applicant_id = auth.uid() and
    not exists (
      select 1 from public.trips
      where trips.id = trip_requests.trip_id and trips.host_id = auth.uid()
    )
  );

create policy "Hosts can update request status"
  on public.trip_requests for update
  to authenticated
  using (
    exists (
      select 1 from public.trips
      where trips.id = trip_requests.trip_id and trips.host_id = auth.uid()
    )
  );
