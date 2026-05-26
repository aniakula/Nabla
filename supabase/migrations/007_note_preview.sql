-- Add markdown_preview to note_sets for card display
-- Run in Supabase SQL Editor

alter table public.note_sets
  add column if not exists markdown_preview text;
