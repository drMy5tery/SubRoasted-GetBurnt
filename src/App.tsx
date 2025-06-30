import React, { useState, useEffect } from 'react';
import { Trophy, Star, Users, Play, RotateCcw } from 'lucide-react';
import { supabase } from './lib/supabase';
import GameScreen from './components/GameScreen';
import Leaderboard from './components/Leaderboard';
import { GameState, LeaderboardEntry } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const submitScore = async (finalScore: number, questions: number, accuracy: number) => {
    if (!username.trim()) return;

    try {
      const { error } = await supabase
        .from('leaderboard')
        .insert({
          username: username.trim(),
          score: finalScore,
          total_questions: questions,
          accuracy: Math.round(accuracy)
        });

      if (error) throw error;
      await fetchLeaderboard();
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const startGame = () => {
    if (username.trim()) {
      setGameState('playing');
      setCurrentScore(0);
      setTotalQuestions(0);
    }
  };

  const endGame = (score: number, questions: number, accuracy: number) => {
    setCurrentScore(score);
    setTotalQuestions(questions);
    submitScore(score, questions, accuracy);
    setGameState('gameOver');
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentScore(0);
    setTotalQuestions(0);
    setUsername('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {gameState === 'menu' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <Star className="w-12 h-12 text-yellow-400 mr-4" />
                <h1 className="text-6xl font-bold text-white">Guess That Comment</h1>
                <Star className="w-12 h-12 text-yellow-400 ml-4" />
              </div>
              <p className="text-xl text-blue-200 mb-8">
                Test your knowledge of internet culture! Can you guess which subreddit these comments came from?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <Play className="w-8 h-8 text-green-400 mr-3" />
                  <h2 className="text-2xl font-bold text-white">Start Playing</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-blue-200 mb-2">
                      Enter your username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      maxLength={20}
                    />
                  </div>
                  <button
                    onClick={startGame}
                    disabled={!username.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    Start Game
                  </button>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                  <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
                </div>
                <Leaderboard entries={leaderboard.slice(0, 5)} />
                <button
                  onClick={() => setGameState('leaderboard')}
                  className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  View Full Leaderboard
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <GameScreen onGameEnd={endGame} />
        )}

        {gameState === 'gameOver' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
              <div className="space-y-2 mb-8">
                <p className="text-2xl text-blue-200">Final Score: <span className="text-yellow-400 font-bold">{currentScore}</span></p>
                <p className="text-lg text-blue-200">Questions Answered: {totalQuestions}</p>
                <p className="text-lg text-blue-200">
                  Accuracy: {totalQuestions > 0 ? Math.round((currentScore / totalQuestions) * 100) : 0}%
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </button>
                <button
                  onClick={() => setGameState('leaderboard')}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Leaderboard
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'leaderboard' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                  <h2 className="text-3xl font-bold text-white">Leaderboard</h2>
                </div>
                <button
                  onClick={() => setGameState('menu')}
                  className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Back to Menu
                </button>
              </div>
              <Leaderboard entries={leaderboard} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;