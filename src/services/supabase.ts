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

export interface PlayerStats {
  totalGames: number;
  totalScore: number;
  averageAccuracy: number;
  bestStreak: number;
  favoriteSubreddits: string[];
  weakestSubreddits: string[];
  totalPlayTime: number;
  rank: number;
}

export interface CommunityStats {
  totalPlayers: number;
  totalGames: number;
  hardestSubreddits: Array<{ name: string; accuracy: number }>;
  easiestSubreddits: Array<{ name: string; accuracy: number }>;
  mostPopularSubreddits: Array<{ name: string; count: number }>;
  averageScore: number;
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

export async function getPlayerStats(username: string): Promise<PlayerStats> {
  if (!supabase) {
    return getMockPlayerStats();
  }

  try {
    // Get player's game history
    const { data: games, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!games || games.length === 0) {
      return getMockPlayerStats();
    }

    // Calculate stats
    const totalGames = games.length;
    const totalScore = games.reduce((sum, game) => sum + game.score, 0);
    const averageAccuracy = Math.round(games.reduce((sum, game) => sum + game.accuracy, 0) / totalGames);
    
    // Mock additional stats for now
    return {
      totalGames,
      totalScore,
      averageAccuracy,
      bestStreak: Math.max(...games.map(g => g.score)),
      favoriteSubreddits: ['AskReddit', 'explainlikeimfive', 'todayilearned'],
      weakestSubreddits: ['programming', 'science', 'technology'],
      totalPlayTime: totalGames * 5, // Estimate 5 minutes per game
      rank: 1
    };
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return getMockPlayerStats();
  }
}

export async function getCommunityStats(): Promise<CommunityStats> {
  if (!supabase) {
    return getMockCommunityStats();
  }

  try {
    // Get total players and games
    const { data: leaderboard, error } = await supabase
      .from('leaderboard')
      .select('*');

    if (error) throw error;

    const uniquePlayers = new Set(leaderboard?.map(entry => entry.username) || []).size;
    const totalGames = leaderboard?.length || 0;
    const averageScore = leaderboard?.length 
      ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.accuracy, 0) / leaderboard.length)
      : 0;

    return {
      totalPlayers: uniquePlayers,
      totalGames,
      averageScore,
      hardestSubreddits: [
        { name: 'programming', accuracy: 34 },
        { name: 'science', accuracy: 38 },
        { name: 'technology', accuracy: 42 },
        { name: 'dataisbeautiful', accuracy: 45 },
        { name: 'politics', accuracy: 48 }
      ],
      easiestSubreddits: [
        { name: 'cats', accuracy: 89 },
        { name: 'dogs', accuracy: 87 },
        { name: 'aww', accuracy: 85 },
        { name: 'funny', accuracy: 82 },
        { name: 'memes', accuracy: 79 }
      ],
      mostPopularSubreddits: [
        { name: 'AskReddit', count: 1250 },
        { name: 'funny', count: 980 },
        { name: 'AmItheAsshole', count: 875 },
        { name: 'explainlikeimfive', count: 720 },
        { name: 'todayilearned', count: 650 }
      ]
    };
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return getMockCommunityStats();
  }
}

// Mock data fallbacks
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

function getMockPlayerStats(): PlayerStats {
  return {
    totalGames: 15,
    totalScore: 127,
    averageAccuracy: 78,
    bestStreak: 8,
    favoriteSubreddits: ['AskReddit', 'explainlikeimfive', 'todayilearned'],
    weakestSubreddits: ['programming', 'science', 'technology'],
    totalPlayTime: 75,
    rank: 42
  };
}

function getMockCommunityStats(): CommunityStats {
  return {
    totalPlayers: 2847,
    totalGames: 15632,
    averageScore: 67,
    hardestSubreddits: [
      { name: 'programming', accuracy: 34 },
      { name: 'science', accuracy: 38 },
      { name: 'technology', accuracy: 42 },
      { name: 'dataisbeautiful', accuracy: 45 },
      { name: 'politics', accuracy: 48 }
    ],
    easiestSubreddits: [
      { name: 'cats', accuracy: 89 },
      { name: 'dogs', accuracy: 87 },
      { name: 'aww', accuracy: 85 },
      { name: 'funny', accuracy: 82 },
      { name: 'memes', accuracy: 79 }
    ],
    mostPopularSubreddits: [
      { name: 'AskReddit', count: 1250 },
      { name: 'funny', count: 980 },
      { name: 'AmItheAsshole', count: 875 },
      { name: 'explainlikeimfive', count: 720 },
      { name: 'todayilearned', count: 650 }
    ]
  };
}