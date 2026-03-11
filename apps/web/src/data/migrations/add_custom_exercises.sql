-- Migration: Add custom exercise support
-- Run this against your existing Supabase database

-- Add new columns to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS objective text;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS apparatus text;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS start_position text;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS movement text[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS pace text;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS school text;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES instructors(id) ON DELETE SET NULL;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Index for efficient custom exercise queries
CREATE INDEX IF NOT EXISTS idx_exercises_creator ON exercises(creator_id) WHERE creator_id IS NOT NULL;

-- Add token_id to classes for marketplace listing tracking
ALTER TABLE classes ADD COLUMN IF NOT EXISTS token_id text;
