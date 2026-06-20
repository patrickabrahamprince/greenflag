-- Add delivered_at column to notifications table for push delivery tracking
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
