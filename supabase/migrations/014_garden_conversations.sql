-- Migration: Garden Conversations
-- Creates table to store garden-wide chat conversations (not tied to a specific plant)

CREATE TABLE IF NOT EXISTS garden_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_garden_conversations_user ON garden_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_garden_conversations_session ON garden_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_garden_conversations_updated ON garden_conversations(updated_at DESC);

-- Enable RLS
ALTER TABLE garden_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see/edit their own conversations
CREATE POLICY "Users can view own garden conversations"
  ON garden_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own garden conversations"
  ON garden_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own garden conversations"
  ON garden_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own garden conversations"
  ON garden_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER update_garden_conversations_updated_at
  BEFORE UPDATE ON garden_conversations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE garden_conversations IS 'Stores garden-wide chat conversation history between the user and AI about their entire garden.';
