/*
  # Initial Schema Setup for GuessThatComment

  1. New Tables
    - `leaderboard`
      - `id` (uuid, primary key)
      - `username` (text, not null)
      - `score` (integer, default 0)
      - `total_questions` (integer, default 0)
      - `accuracy` (integer, default 0)
      - `created_at` (timestamp)
    
    - `cringe_ratings`
      - `id` (uuid, primary key)
      - `comment_id` (text, not null)
      - `user_id` (text, not null)
      - `rating` (integer, 0-4 scale)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for anonymous and authenticated users to read/write
    - Add check constraint for rating values

  3. Indexes
    - Primary key indexes
    - Performance indexes for common queries
*/

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  accuracy integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create cringe_ratings table
CREATE TABLE IF NOT EXISTS cringe_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id text NOT NULL,
  user_id text NOT NULL,
  rating integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT cringe_ratings_rating_check CHECK (rating >= 0 AND rating <= 4)
);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE cringe_ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DO $$
BEGIN
  -- Drop and recreate leaderboard policies
  DROP POLICY IF EXISTS "Anyone can read leaderboard" ON leaderboard;
  DROP POLICY IF EXISTS "Anyone can insert scores" ON leaderboard;
  
  CREATE POLICY "Anyone can read leaderboard"
    ON leaderboard
    FOR SELECT
    TO anon, authenticated
    USING (true);

  CREATE POLICY "Anyone can insert scores"
    ON leaderboard
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  -- Drop and recreate cringe_ratings policies
  DROP POLICY IF EXISTS "Anyone can read cringe ratings" ON cringe_ratings;
  DROP POLICY IF EXISTS "Anyone can insert cringe ratings" ON cringe_ratings;
  
  CREATE POLICY "Anyone can read cringe ratings"
    ON cringe_ratings
    FOR SELECT
    TO anon, authenticated
    USING (true);

  CREATE POLICY "Anyone can insert cringe ratings"
    ON cringe_ratings
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS leaderboard_score_idx ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS leaderboard_accuracy_idx ON leaderboard(accuracy DESC);
CREATE INDEX IF NOT EXISTS leaderboard_created_at_idx ON leaderboard(created_at DESC);
CREATE INDEX IF NOT EXISTS cringe_ratings_comment_id_idx ON cringe_ratings(comment_id);