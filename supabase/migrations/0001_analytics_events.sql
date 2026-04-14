-- US-003 / AC-5: analytics_events table + RLS
-- Apply via Supabase Dashboard → SQL Editor → paste → Run

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_profile_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  synced_at TIMESTAMPTZ
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own events" ON analytics_events;
CREATE POLICY "Users can insert own events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own events" ON analytics_events;
CREATE POLICY "Users can read own events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own events" ON analytics_events;
CREATE POLICY "Users can update own events"
  ON analytics_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_synced
  ON analytics_events(user_id, synced_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created
  ON analytics_events(user_id, created_at DESC);
