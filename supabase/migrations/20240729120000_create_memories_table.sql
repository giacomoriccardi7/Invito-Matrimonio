/*
  # Create Memories Table for Digital Memory Album

  ## Overview
  This migration creates the database structure for managing uploaded photos and videos for the digital memory album.

  ## New Tables
  
  ### `memories`
  Stores information about each uploaded photo/video including:
  - `id` (uuid, primary key) - Unique identifier for each memory
  - `file_path` (text, required) - Path to the stored file in cloud storage (e.g., Supabase Storage).
  - `file_type` (text, required) - Type of file, either 'image' or 'video'.
  - `uploader_name` (text, optional) - Name provided by the guest who uploaded the memory.
  - `dedication` (text, optional) - An optional message or dedication from the uploader.
  - `created_at` (timestamptz) - Timestamp when the memory was submitted.
  - `is_approved` (boolean, default false) - Flag for moderation by the couple. Only approved memories will be shown in the public gallery/live feed.
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on `memories` table.
  - Guests (anon) can insert memories.
  - Authenticated users (the couple) can view all memories and update the `is_approved` status.
  
  ## Notes
  - `file_path` will store the URL or reference to the file in Supabase Storage.
  - `uploader_name` and `dedication` are optional to allow for anonymous uploads or simple sharing.
*/

-- Create the memories table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  file_type text NOT NULL,
  uploader_name text,
  dedication text,
  created_at timestamptz DEFAULT now(),
  is_approved boolean DEFAULT FALSE
);

-- Disable RLS temporarily to ensure policy changes are applied
ALTER TABLE memories DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Guests can insert memories" ON memories;
DROP POLICY IF EXISTS "Anon can view approved memories" ON memories;
DROP POLICY IF EXISTS "Authenticated users can manage memories" ON memories;

-- Allow anyone to insert a memory
CREATE POLICY "Guests can insert memories"
  ON memories
  FOR INSERT
  TO anon, authenticator
  WITH CHECK (true);

CREATE POLICY "Anon can view approved memories"
  ON memories
  FOR SELECT
  TO anon
  USING (is_approved = true);

-- Allow authenticated users (the couple) to view all memories and update approval status
CREATE POLICY "Authenticated users can manage memories"
  ON memories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can view approved memories"
  ON memories
  FOR SELECT
  TO anon
  USING (is_approved = true);

-- Allow authenticated users (the couple) to view all memories and update approval status
CREATE POLICY "Authenticated users can manage memories"
  ON memories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Added a comment to force migration detection again