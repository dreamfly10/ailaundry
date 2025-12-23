-- Create articles table to store processed articles
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_content TEXT NOT NULL,
  translated_content TEXT NOT NULL,
  insights TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('url', 'text')),
  source_url TEXT, -- Only for URL input type
  style TEXT CHECK (style IN ('warmBookish', 'lifeReflection', 'contrarian', 'education', 'science')),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own articles
CREATE POLICY "Users can view own articles" ON articles
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Create policy: Users can insert their own articles
CREATE POLICY "Users can insert own articles" ON articles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create policy: Users can update their own articles
CREATE POLICY "Users can update own articles" ON articles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create policy: Users can delete their own articles
CREATE POLICY "Users can delete own articles" ON articles
  FOR DELETE USING (auth.uid()::text = user_id::text);

