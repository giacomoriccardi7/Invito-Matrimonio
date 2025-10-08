/*
  # Create RSVP Table for Wedding Invitations

  ## Overview
  This migration creates the database structure for managing wedding RSVP responses from guests.

  ## New Tables
  
  ### `rsvp_responses`
  Stores guest responses to wedding invitations including:
  - `id` (uuid, primary key) - Unique identifier for each response
  - `guest_name` (text, required) - Full name of the guest
  - `will_attend` (boolean, required) - Whether the guest will attend
  - `dietary_restrictions` (text, optional) - Any food allergies or intolerances
  - `song_request` (text, optional) - Requested song for the reception
  - `message` (text, optional) - Personal message for the couple
  - `created_at` (timestamptz) - Timestamp when response was submitted
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on `rsvp_responses` table
  - Public can insert their own responses
  - Only authenticated users (admins) can view all responses
  
  ## Notes
  - Guests can submit responses without authentication
  - The couple can authenticate to view all responses
  - All fields except dietary restrictions, song request, and message are required
*/

-- Create the rsvp_responses table
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  will_attend boolean NOT NULL,
  dietary_restrictions text DEFAULT '',
  song_request text DEFAULT '',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their RSVP response
CREATE POLICY "Anyone can submit RSVP"
  ON rsvp_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users (the couple) to view all responses
CREATE POLICY "Authenticated users can view all RSVPs"
  ON rsvp_responses
  FOR SELECT
  TO authenticated
  USING (true);