import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { MessageCircle, Play, Trophy, Zap } from 'lucide-react';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { dispatch } = useGame();
  const [playerName, setPlayerName] = useState('');

  const handleStartGame = () => {
    if (playerName.trim()) {
      dispatch({ type: 'SET_PLAYER_NAME', payload: playerName.trim() });
      dispatch({ type: 'START_GAME' });
      navigate('/game');
    }
  };

  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <MessageCircle className="w-16 h-16 text-blue-400 mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                Guess<span className="text-blue-400">That</span>Comment
              </h1>
            </div>
            <p className="text-xl text-gray-300 leading-relaxed">
              Test your Reddit knowledge by guessing which subreddit a comment came from.
              <br />
              <span className="text-red-400 font-semibold">Get roasted by AI when you're wrong!</span>
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Real Comments</h3>
              <p className="text-gray-400 text-sm">From actual Reddit posts</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">AI Roasts</h3>
              <p className="text-gray-400 text-sm">Get burned for wrong guesses</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Leaderboard</h3>
              <p className="text-gray-400 text-sm">Compete with others</p>
            </div>
          </div>

          {/* Player Name Input */}
          <div className="mb-8">
            <label htmlFor="playerName" className="block text-white font-semibold mb-3 text-lg">
              Enter Your Username
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Choose your Reddit warrior name..."
              className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleStartGame}
              disabled={!playerName.trim()}
              className="flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-lg"
            >
              <Play className="w-6 h-6 mr-2" />
              Start Playing
            </button>
            <button
              onClick={handleViewLeaderboard}
              className="flex-1 flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 text-lg"
            >
              <Trophy className="w-6 h-6 mr-2" />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            Built with{' '}
            <a
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Bolt.new
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}