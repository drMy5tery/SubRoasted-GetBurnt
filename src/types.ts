export type GameState = 'menu' | 'playing' | 'gameOver' | 'leaderboard';

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  total_questions: number;
  accuracy: number;
  created_at: string;
}

export interface Comment {
  id: string;
  text: string;
  subreddit: string;
  author: string;
}

export interface Question {
  comment: Comment;
  options: string[];
  correctAnswer: string;
}

export interface CringeRating {
  id: string;
  comment_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}