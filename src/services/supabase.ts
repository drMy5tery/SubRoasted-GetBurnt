import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('https://');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  total_questions: number;
  accuracy: number;
  created_at: string;
}

export interface CringeRating {
  id: string;
  comment_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export async function saveGameScore(username: string, score: number, totalQuestions: number) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping score save');
    return;
  }

  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  
  const { error } = await supabase
    .from('leaderboard')
    .insert([
      {
        username,
        score,
        total_questions: totalQuestions,
        accuracy,
      }
    ]);

  if (error) {
    console.error('Error saving score:', error);
    throw error;
  }
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  if (!supabase) {
    console.warn('Supabase not configured, returning mock leaderboard');
    return getMockLeaderboard();
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return getMockLeaderboard();
  }

  return data || [];
}

export async function saveCringeRatingToSupabase(commentId: string, userId: string, rating: number) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping cringe rating save');
    return;
  }

  const { error } = await supabase
    .from('cringe_ratings')
    .insert([
      {
        comment_id: commentId,
        user_id: userId,
        rating,
      }
    ]);

  if (error) {
    console.error('Error saving cringe rating:', error);
    throw error;
  }
}

// Mock data fallback when Supabase is not configured
function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    {
      id: '1',
      username: 'RedditMaster2024',
      score: 47,
      total_questions: 50,
      accuracy: 94,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      username: 'CommentConnoisseur',
      score: 38,
      total_questions: 42,
      accuracy: 90,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      username: 'SubredditSleuth',
      score: 35,
      total_questions: 40,
      accuracy: 88,
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      username: 'GuessGameGuru',
      score: 29,
      total_questions: 35,
      accuracy: 83,
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      username: 'RandomRedditor',
      score: 25,
      total_questions: 30,
      accuracy: 83,
      created_at: new Date().toISOString(),
    },
  ];
}