import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, BarChart3, TrendingUp, Target, Clock, 
  Award, Users, Zap, Brain, Trophy 
} from 'lucide-react';
import { getPlayerStats, getCommunityStats } from '../services/supabase';

interface PlayerStats {
  totalGames: number;
  totalScore: number;
  averageAccuracy: number;
  bestStreak: number;
  favoriteSubreddits: string[];
  weakestSubreddits: string[];
  totalPlayTime: number;
  rank: number;
}

interface CommunityStats {
  totalPlayers: number;
  totalGames: number;
  hardestSubreddits: Array<{ name: string; accuracy: number }>;
  easiestSubreddits: Array<{ name: string; accuracy: number }>;
  mostPopularSubreddits: Array<{ name: string; count: number }>;
  averageScore: number;
}

export default function StatsScreen() {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'community'>('personal');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [playerData, communityData] = await Promise.all([
        getPlayerStats('current-player'), // You'd get this from context
        getCommunityStats()
      ]);
      setPlayerStats(playerData);
      setCommunityStats(communityData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'blue' }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <div className={`backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-${color}-500/30 transition-all duration-200`}>
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-xl bg-${color}-500/20 mr-4`}>
          {icon}
        </div>
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className={`text-3xl font-bold text-${color}-400`}>
        {value}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading your stats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
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
              <BarChart3 className="w-8 h-8 mr-2 text-blue-400" />
              Statistics
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-4 px-6 rounded-l-2xl font-semibold transition-all duration-200 ${
              activeTab === 'personal'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Target className="w-5 h-5 inline mr-2" />
            Personal Stats
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-4 px-6 rounded-r-2xl font-semibold transition-all duration-200 ${
              activeTab === 'community'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Community Stats
          </button>
        </div>

        {/* Personal Stats Tab */}
        {activeTab === 'personal' && playerStats && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<Trophy className="w-6 h-6 text-yellow-400" />}
                title="Total Score"
                value={playerStats.totalScore}
                subtitle="All time points"
                color="yellow"
              />
              <StatCard
                icon={<Target className="w-6 h-6 text-green-400" />}
                title="Accuracy"
                value={`${playerStats.averageAccuracy}%`}
                subtitle="Average correct"
                color="green"
              />
              <StatCard
                icon={<Zap className="w-6 h-6 text-orange-400" />}
                title="Best Streak"
                value={playerStats.bestStreak}
                subtitle="Consecutive correct"
                color="orange"
              />
              <StatCard
                icon={<Clock className="w-6 h-6 text-blue-400" />}
                title="Games Played"
                value={playerStats.totalGames}
                subtitle="Total sessions"
                color="blue"
              />
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strongest Subreddits */}
              <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-2 text-green-400" />
                  Your Strongest Subreddits
                </h3>
                <div className="space-y-4">
                  {playerStats.favoriteSubreddits.map((subreddit, index) => (
                    <div key={subreddit} className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold mr-4">
                          {index + 1}
                        </span>
                        <span className="text-white font-semibold">r/{subreddit}</span>
                      </div>
                      <div className="text-green-400 font-bold">95%+</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weakest Subreddits */}
              <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Brain className="w-6 h-6 mr-2 text-red-400" />
                  Room for Improvement
                </h3>
                <div className="space-y-4">
                  {playerStats.weakestSubreddits.map((subreddit, index) => (
                    <div key={subreddit} className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold mr-4">
                          {index + 1}
                        </span>
                        <span className="text-white font-semibold">r/{subreddit}</span>
                      </div>
                      <div className="text-red-400 font-bold">45%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Stats Tab */}
        {activeTab === 'community' && communityStats && (
          <div className="space-y-8">
            {/* Community Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={<Users className="w-6 h-6 text-purple-400" />}
                title="Total Players"
                value={communityStats.totalPlayers.toLocaleString()}
                subtitle="Active community"
                color="purple"
              />
              <StatCard
                icon={<Trophy className="w-6 h-6 text-blue-400" />}
                title="Games Played"
                value={communityStats.totalGames.toLocaleString()}
                subtitle="All time"
                color="blue"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6 text-green-400" />}
                title="Average Score"
                value={`${communityStats.averageScore}%`}
                subtitle="Community accuracy"
                color="green"
              />
            </div>

            {/* Community Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Hardest Subreddits */}
              <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Brain className="w-6 h-6 mr-2 text-red-400" />
                  Hardest Subreddits
                </h3>
                <div className="space-y-4">
                  {communityStats.hardestSubreddits.map((subreddit, index) => (
                    <div key={subreddit.name} className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold mr-4">
                          {index + 1}
                        </span>
                        <span className="text-white font-semibold">r/{subreddit.name}</span>
                      </div>
                      <div className="text-red-400 font-bold">{subreddit.accuracy}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Easiest Subreddits */}
              <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-green-400" />
                  Easiest Subreddits
                </h3>
                <div className="space-y-4">
                  {communityStats.easiestSubreddits.map((subreddit, index) => (
                    <div key={subreddit.name} className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold mr-4">
                          {index + 1}
                        </span>
                        <span className="text-white font-semibold">r/{subreddit.name}</span>
                      </div>
                      <div className="text-green-400 font-bold">{subreddit.accuracy}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}