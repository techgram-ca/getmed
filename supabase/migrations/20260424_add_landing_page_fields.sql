-- Add landing page customisation columns to the pharmacies table.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

ALTER TABLE pharmacies
  ADD COLUMN IF NOT EXISTS hero_image_url    text,
  ADD COLUMN IF NOT EXISTS hero_title        text,
  ADD COLUMN IF NOT EXISTS hero_subtitle     text,
  ADD COLUMN IF NOT EXISTS about_heading     text,
  ADD COLUMN IF NOT EXISTS about_description text,
  ADD COLUMN IF NOT EXISTS landing_stats     jsonb DEFAULT '[]'::jsonb;

-- landing_stats stores an ordered array of { "value": "...", "label": "..." } objects.
-- Up to 3 entries are shown on the landing page; extras are ignored.
