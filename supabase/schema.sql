-- ============================================================
-- GetMed – Pharmacy Schema
-- Run in Supabase → SQL Editor
-- ============================================================

-- 1. Custom enum for review status
create type pharmacy_status as enum (
  'pending',    -- submitted, awaiting admin review
  'approved',   -- live on the platform
  'rejected',   -- rejected with reason
  'suspended'   -- temporarily disabled
);

-- ============================================================
-- 2. Pharmacies
-- ============================================================
create table if not exists public.pharmacies (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete cascade not null unique,

  -- Contact
  email                 text,
  contact_name          text not null,
  phone                 text not null,

  -- Identity
  legal_name            text not null,
  display_name          text not null,
  logo_url              text,            -- public URL from pharmacy-logos storage bucket
  url_slug              text unique,     -- auto-generated from display_name + city

  -- Address
  full_address          text not null,
  unit                  text,
  city                  text not null,
  province              text not null,
  postal_code           text not null,
  lat                   double precision,
  lng                   double precision,

  -- License
  license_number        text not null,
  license_url           text,            -- path in pharmacy-licenses storage bucket

  -- Operations (stored as JSONB for flexibility)
  -- Shape: { "Monday": { "open": true, "openTime": "09:00", "closeTime": "18:00" }, ... }
  opening_hours         jsonb not null default '{}',
  payment_methods       text[] not null default '{}',

  -- Services
  service_online_orders boolean not null default false,
  service_delivery      boolean not null default false,
  service_consultation  boolean not null default false,

  -- Admin review
  status                pharmacy_status not null default 'pending',
  rejection_reason      text,
  reviewed_at           timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- 3. Pharmacist Profiles  (only for pharmacies with consultation)
-- ============================================================
create table if not exists public.pharmacist_profiles (
  id                    uuid primary key default gen_random_uuid(),
  pharmacy_id           uuid references public.pharmacies(id) on delete cascade not null unique,

  full_name             text not null,
  photo_url             text,            -- public URL from pharmacist-photos bucket
  qualification         text not null,
  license_number        text not null,
  years_of_experience   integer check (years_of_experience >= 0 and years_of_experience <= 100),
  specialization        text[] not null default '{}',
  languages             text[] not null default '{}',
  bio                   text,

  -- Shape mirrors opening_hours above
  availability_hours    jsonb not null default '{}',
  consultation_modes    text[] not null default '{}',   -- ['chat','phone','video']
  consultation_fee      numeric(10,2) check (consultation_fee >= 0),

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- 4. Orders
-- ============================================================
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  pharmacy_id   uuid references public.pharmacies(id) on delete cascade not null,

  order_type    text not null check (order_type in ('prescription', 'transfer', 'otc')),
  patient_name  text not null,
  patient_phone text not null,
  patient_email text,
  delivery_type text not null check (delivery_type in ('pickup', 'delivery')),
  address       text,

  -- Order-type specific fields stored as JSONB
  details       jsonb not null default '{}',

  -- Paths in prescription-uploads storage bucket
  file_urls     text[] not null default '{}',

  status        text not null default 'new'
                  check (status in ('new', 'processing', 'ready', 'completed', 'cancelled')),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- 5. Auto-update timestamps trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pharmacies_set_updated_at
  before update on public.pharmacies
  for each row execute function public.set_updated_at();

create trigger pharmacist_profiles_set_updated_at
  before update on public.pharmacist_profiles
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- 6. App Settings  (key-value config, admin-managed)
-- ============================================================
create table if not exists public.app_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- Seed default radius
insert into public.app_settings (key, value)
values ('search_radius_km', '10')
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

-- Anyone can read settings (needed for public search page server-side)
create policy "settings_public_read" on public.app_settings
  for select to anon, authenticated using (true);

-- ============================================================
-- 7. Indexes
-- ============================================================
create index if not exists pharmacies_user_id_idx         on public.pharmacies(user_id);
create index if not exists pharmacies_status_idx          on public.pharmacies(status);
create index if not exists pharmacies_city_province_idx   on public.pharmacies(city, province);
create index if not exists pharmacies_url_slug_idx        on public.pharmacies(url_slug);
create index if not exists pharmacist_profiles_pharm_idx  on public.pharmacist_profiles(pharmacy_id);
create index if not exists orders_pharmacy_id_idx         on public.orders(pharmacy_id);
create index if not exists orders_status_idx              on public.orders(status);
create index if not exists orders_created_at_idx          on public.orders(created_at desc);

-- ============================================================
-- 8. Row Level Security
-- ============================================================
alter table public.pharmacies          enable row level security;
alter table public.pharmacist_profiles enable row level security;
alter table public.orders              enable row level security;

-- Pharmacies: each pharmacy owner manages only their own row
create policy "pharmacy_owner_select" on public.pharmacies
  for select to authenticated using (auth.uid() = user_id);

create policy "pharmacy_owner_insert" on public.pharmacies
  for insert to authenticated with check (auth.uid() = user_id);

create policy "pharmacy_owner_update" on public.pharmacies
  for update to authenticated using (auth.uid() = user_id);

-- Pharmacist profiles: accessible only through the owning pharmacy
create policy "pharmacist_owner_select" on public.pharmacist_profiles
  for select to authenticated
  using (exists (
    select 1 from public.pharmacies
    where id = pharmacy_id and user_id = auth.uid()
  ));

create policy "pharmacist_owner_insert" on public.pharmacist_profiles
  for insert to authenticated
  with check (exists (
    select 1 from public.pharmacies
    where id = pharmacy_id and user_id = auth.uid()
  ));

create policy "pharmacist_owner_update" on public.pharmacist_profiles
  for update to authenticated
  using (exists (
    select 1 from public.pharmacies
    where id = pharmacy_id and user_id = auth.uid()
  ));

-- Orders: pharmacy owners can read and update their own pharmacy's orders
-- (Inserts are done server-side via admin client — no anon insert policy needed)
create policy "orders_pharmacy_select" on public.orders
  for select to authenticated
  using (exists (
    select 1 from public.pharmacies
    where id = pharmacy_id and user_id = auth.uid()
  ));

create policy "orders_pharmacy_update" on public.orders
  for update to authenticated
  using (exists (
    select 1 from public.pharmacies
    where id = pharmacy_id and user_id = auth.uid()
  ));

-- ============================================================
-- 9. Storage Buckets
-- Run this block separately if the above completes successfully.
-- Alternatively, create buckets via Supabase Dashboard → Storage.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'pharmacy-logos',
    'pharmacy-logos',
    true,                     -- public: patients can view pharmacy logos
    5242880,                  -- 5 MB
    array['image/jpeg','image/jpg','image/png','image/webp']
  ),
  (
    'pharmacy-licenses',
    'pharmacy-licenses',
    false,                    -- private: only owner can read
    10485760,                 -- 10 MB
    array['application/pdf','image/jpeg','image/jpg','image/png','image/webp']
  ),
  (
    'pharmacist-photos',
    'pharmacist-photos',
    true,                     -- public: patients can view
    5242880,                  -- 5 MB
    array['image/jpeg','image/jpg','image/png','image/webp']
  ),
  (
    'prescription-uploads',
    'prescription-uploads',
    false,                    -- private: pharmacy staff only
    20971520,                 -- 20 MB
    array['image/jpeg','image/jpg','image/png','image/webp','application/pdf']
  )
on conflict (id) do nothing;

-- ============================================================
-- 10. Storage RLS Policies
-- ============================================================

-- Pharmacy logos: public read, owner upload
create policy "pharmacy_logo_public_read" on storage.objects
  for select to public
  using (bucket_id = 'pharmacy-logos');

create policy "pharmacy_logo_owner_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pharmacy-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Pharmacy licenses: only owner can upload / read their own license
create policy "license_owner_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pharmacy-licenses'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "license_owner_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pharmacy-licenses'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Pharmacist photos: public read, owner upload
create policy "pharmacist_photo_public_read" on storage.objects
  for select to public
  using (bucket_id = 'pharmacist-photos');

create policy "pharmacist_photo_owner_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pharmacist-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Prescription uploads: pharmacy owners can read uploads for their pharmacy
-- (Inserts are done via admin client in submitOrderAction)
create policy "prescription_uploads_pharmacy_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'prescription-uploads'
    and exists (
      select 1 from public.pharmacies
      where id::text = (storage.foldername(name))[1]
        and user_id = auth.uid()
    )
  );

-- ============================================================
-- MIGRATION: Add url_slug to existing pharmacies table
-- Run this block ONLY if the table already exists.
-- ============================================================

-- alter table public.pharmacies
--   add column if not exists url_slug text unique;

-- create index if not exists pharmacies_url_slug_idx on public.pharmacies(url_slug);

-- ============================================================
-- MIGRATION: Add orders table (if it doesn't exist yet)
-- ============================================================

-- create table if not exists public.orders (
--   id            uuid primary key default gen_random_uuid(),
--   pharmacy_id   uuid references public.pharmacies(id) on delete cascade not null,
--   order_type    text not null check (order_type in ('prescription', 'transfer', 'otc')),
--   patient_name  text not null,
--   patient_phone text not null,
--   patient_email text,
--   delivery_type text not null check (delivery_type in ('pickup', 'delivery')),
--   address       text,
--   details       jsonb not null default '{}',
--   file_urls     text[] not null default '{}',
--   status        text not null default 'new'
--                   check (status in ('new', 'processing', 'ready', 'completed', 'cancelled')),
--   created_at    timestamptz not null default now(),
--   updated_at    timestamptz not null default now()
-- );
--
-- create trigger orders_set_updated_at
--   before update on public.orders
--   for each row execute function public.set_updated_at();
--
-- alter table public.orders enable row level security;
--
-- create policy "orders_pharmacy_select" on public.orders
--   for select to authenticated
--   using (exists (
--     select 1 from public.pharmacies
--     where id = pharmacy_id and user_id = auth.uid()
--   ));
--
-- create policy "orders_pharmacy_update" on public.orders
--   for update to authenticated
--   using (exists (
--     select 1 from public.pharmacies
--     where id = pharmacy_id and user_id = auth.uid()
--   ));
--
-- create index if not exists orders_pharmacy_id_idx on public.orders(pharmacy_id);
-- create index if not exists orders_status_idx on public.orders(status);
-- create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- ============================================================
-- MIGRATION: Add prescription-uploads bucket (if not exists)
-- ============================================================

-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- values (
--   'prescription-uploads', 'prescription-uploads',
--   false,
--   20971520,
--   array['image/jpeg','image/jpg','image/png','image/webp','application/pdf']
-- )
-- on conflict (id) do nothing;
--
-- create policy "prescription_uploads_pharmacy_read" on storage.objects
--   for select to authenticated
--   using (
--     bucket_id = 'prescription-uploads'
--     and exists (
--       select 1 from public.pharmacies
--       where id::text = (storage.foldername(name))[1]
--         and user_id = auth.uid()
--     )
--   );

-- ============================================================
-- MIGRATION: Add consultations table
-- Run this block in Supabase → SQL Editor
-- ============================================================

create table if not exists public.consultations (
  id              uuid primary key default gen_random_uuid(),
  pharmacy_id     uuid references public.pharmacies(id) on delete cascade not null,

  patient_name    text not null,
  patient_phone   text not null,
  patient_email   text,

  condition       text,
  notes           text,

  status          text not null default 'pending'
                    check (status in ('pending', 'in_progress', 'completed', 'cancelled')),

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger consultations_set_updated_at
  before update on public.consultations
  for each row execute function public.set_updated_at();

alter table public.consultations enable row level security;

create policy "consultations_pharmacy_select" on public.consultations
  for select to authenticated
  using (exists (
    select 1 from public.pharmacies
    where id = pharmacy_id and user_id = auth.uid()
  ));

create policy "consultations_pharmacy_update" on public.consultations
  for update to authenticated
  using (exists (
    select 1 from public.pharmacies
    where id = pharmacy_id and user_id = auth.uid()
  ));

create index if not exists consultations_pharmacy_id_idx  on public.consultations(pharmacy_id);
create index if not exists consultations_status_idx        on public.consultations(status);
create index if not exists consultations_created_at_idx   on public.consultations(created_at desc);

-- ============================================================
-- MIGRATION: Add logo_url to existing pharmacies table
-- Run this block ONLY if the table already exists (skip if
-- running the full schema above for the first time).
-- ============================================================

-- alter table public.pharmacies
--   add column if not exists logo_url text;

-- New storage bucket for pharmacy logos
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- values (
--   'pharmacy-logos',
--   'pharmacy-logos',
--   true,
--   5242880,
--   array['image/jpeg','image/jpg','image/png','image/webp']
-- )
-- on conflict (id) do nothing;

-- Storage RLS policies for pharmacy logos
-- create policy "pharmacy_logo_public_read" on storage.objects
--   for select to public
--   using (bucket_id = 'pharmacy-logos');

-- create policy "pharmacy_logo_owner_upload" on storage.objects
--   for insert to authenticated
--   with check (
--     bucket_id = 'pharmacy-logos'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );

-- ============================================================
-- MIGRATION: Add app_settings table (if table doesn't exist yet)
-- ============================================================

-- create table if not exists public.app_settings (
--   key        text primary key,
--   value      text not null,
--   updated_at timestamptz not null default now()
-- );
-- insert into public.app_settings (key, value)
-- values ('search_radius_km', '10')
-- on conflict (key) do nothing;
-- alter table public.app_settings enable row level security;
-- create policy "settings_public_read" on public.app_settings
--   for select to anon, authenticated using (true);

-- ============================================================
-- MIGRATION: Drivers module
-- ============================================================

create type driver_status as enum (
  'pending',
  'approved',
  'rejected',
  'suspended'
);

create table if not exists public.drivers (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null unique,

  -- Contact
  email             text,
  full_name         text not null,
  phone             text not null,
  photo_url         text,
  url_slug          text unique,

  -- Service area
  city              text not null,
  province          text not null,
  postal_code       text not null,

  -- Vehicle
  vehicle_type      text,
  vehicle_make      text,
  vehicle_model     text,
  vehicle_year      integer,
  vehicle_plate     text,

  -- Driver's license
  license_number    text not null,
  license_expiry    date,
  license_province  text,
  license_url       text,        -- stored as storage path; use signed URL to retrieve

  -- Admin review
  status            driver_status not null default 'pending',
  rejection_reason  text,
  reviewed_at       timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists drivers_user_id_idx       on public.drivers(user_id);
create index if not exists drivers_status_idx        on public.drivers(status);
create index if not exists drivers_city_province_idx on public.drivers(city, province);
create index if not exists drivers_url_slug_idx      on public.drivers(url_slug);

alter table public.drivers enable row level security;

create policy "driver_owner_select" on public.drivers
  for select to authenticated using (auth.uid() = user_id);

create policy "driver_owner_update" on public.drivers
  for update to authenticated using (auth.uid() = user_id);

create policy "driver_owner_insert" on public.drivers
  for insert to authenticated with check (auth.uid() = user_id);

create trigger drivers_set_updated_at
  before update on public.drivers
  for each row execute function public.set_updated_at();

-- Storage: driver-photos (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'driver-photos', 'driver-photos', true, 5242880,
  array['image/jpeg','image/jpg','image/png','image/webp']
) on conflict (id) do nothing;

-- Storage: driver-licenses (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'driver-licenses', 'driver-licenses', false, 10485760,
  array['application/pdf','image/jpeg','image/jpg','image/png','image/webp']
) on conflict (id) do nothing;
