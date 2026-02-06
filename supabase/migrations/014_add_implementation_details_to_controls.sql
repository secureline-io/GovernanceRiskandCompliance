-- ============================================
-- GRC Platform - Add implementation_details to controls
-- Migration 014: Missing column referenced by API
-- ============================================

ALTER TABLE controls ADD COLUMN IF NOT EXISTS implementation_details TEXT;
