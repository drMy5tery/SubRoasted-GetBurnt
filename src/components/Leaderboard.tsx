import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-blue-300 font-bold">#{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
      case 1:
        return 'bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-300/30';
      case 2:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/30';
      default:
        return 'bg-white/10 border-white/20';
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-blue-200">No scores yet. Be the first to play!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className={`flex items-center justify-between p-4 rounded-lg border ${getRankColor(index)} transition-all duration-200 hover:scale-105`}
        >
          <div className="flex items-center space-x-4">
            {getRankIcon(index)}
            <div>
              <p className="font-bold text-white">{entry.username}</p>
              <p className="text-sm text-blue-200">
                {entry.total_questions} questions • {entry.accuracy}% accuracy
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-400">{entry.score}</p>
            <p className="text-xs text-blue-300">
              {new Date(entry.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;