-- Migration: Add stellar_address column to profiles table
-- This column is required by booking and property services for blockchain operations

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stellar_address TEXT;

-- Index for fast lookups by Stellar public key
CREATE INDEX IF NOT EXISTS idx_profiles_stellar_address
  ON public.profiles(stellar_address)
  WHERE stellar_address IS NOT NULL;
