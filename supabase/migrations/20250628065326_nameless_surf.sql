/*
  # Create cringe ratings table

  1. New Tables
    - `cringe_ratings`
      - `id` (uuid, primary key)
      - `comment_id` (text, not null)
      - `user_id` (text, not null)
      - `rating` (integer, not null, 0-4)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `cringe_ratings` table
    - Add policy for anyone to read ratings
    - Add policy for anyone to insert ratings
*/

CREATE TABLE IF NOT EXISTS cringe_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id text NOT NULL,
  user_id text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 0 AND rating <= 4),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cringe_ratings ENABLE ROW LEVEL SECURITY;

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