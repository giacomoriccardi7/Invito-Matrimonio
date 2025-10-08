-- Add moderation_status to memories and create moderation_logs table

-- Add a moderation_status column with default 'pending'
ALTER TABLE public.memories
ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'pending';

-- Create moderation_logs table to track approve/reject operations
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('approved','rejected')),
  actor text,
  created_at timestamptz DEFAULT now()
);

-- Basic RLS policies (optional, server uses service role)
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated manage moderation logs" ON public.moderation_logs;
CREATE POLICY "Authenticated manage moderation logs"
  ON public.moderation_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);