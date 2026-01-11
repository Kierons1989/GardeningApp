-- Migration: Plant Conversations
-- Creates table to store chat conversations between users and AI about specific plants

CREATE TABLE IF NOT EXISTS plant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE NOT NULL,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_conversations_user ON plant_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_plant ON plant_conversations(plant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON plant_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON plant_conversations(updated_at DESC);

-- Enable RLS
ALTER TABLE plant_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see/edit their own conversations
CREATE POLICY "Users can view own conversations"
  ON plant_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON plant_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON plant_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON plant_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON plant_conversations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add comment
COMMENT ON TABLE plant_conversations IS 'Stores chat conversation history between users and AI about specific plants. Messages stored as JSONB array with role and content.';
COMMENT ON COLUMN plant_conversations.messages IS 'Array of message objects: [{role: "user" | "assistant", content: string, timestamp: string}]';
