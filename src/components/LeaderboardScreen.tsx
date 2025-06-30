import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Trophy, Medal, Award } from 'lucide-react';
import { getLeaderboard } from '../services/supabase';
import type { LeaderboardEntry } from '../services/supabase';

export default function LeaderboardScreen() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-white font-bold">{rank}</span>;
    }
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
      case 3:
        return 'from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'from-white/5 to-white/10 border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-white hover:text-blue-400 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </button>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="w-8 h-8 mr-2 text-yellow-400" />
              Leaderboard
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Leaderboard */}
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Top Reddit Guessers
          </h2>

          <div className="space-y-4">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              return (
                <div
                  key={entry.id}
                  className={`bg-gradient-to-r ${getRankColors(rank)} rounded-xl p-6 border transition-all duration-200 hover:scale-105`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
                        {getRankIcon(rank)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{entry.username}</h3>
                        <p className="text-gray-300">
                          {entry.score} correct out of {entry.total_questions} questions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{entry.score}</div>
                      <div className="text-sm text-gray-300">{entry.accuracy}% accuracy</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No scores yet!</h3>
              <p className="text-gray-400">Be the first to play and claim the top spot!</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            Play Now to Join the Leaderboard!
          </button>
        </div>

        {/* Built with Bolt.new Badge */}
        <div className="text-center mt-8">
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm rounded-lg transition-all duration-200"
          >
            Built with ⚡ Bolt.new
          </a>
        </div>
      </div>
    </div>
  );
}