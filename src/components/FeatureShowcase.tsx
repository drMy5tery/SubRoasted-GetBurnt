import React from 'react';
import { 
  Trophy, Users, Timer, Target, Zap, Brain, 
  MessageSquare, TrendingUp, Award, Star,
  Clock, BarChart3, Gamepad2, Sparkles
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'available' | 'coming-soon' | 'premium';
  gradient: string;
}

function FeatureCard({ icon, title, description, status, gradient }: FeatureCardProps) {
  const statusColors = {
    available: 'bg-green-500/20 text-green-400 border-green-500/30',
    'coming-soon': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  const statusText = {
    available: 'Available',
    'coming-soon': 'Coming Soon',
    premium: 'Premium'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group`}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
            {icon}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}>
            {statusText[status]}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

export default function FeatureShowcase() {
  const features = [
    {
      icon: <Timer className="w-6 h-6 text-blue-400" />,
      title: 'Speed Mode',
      description: 'Race against time! Answer questions quickly for bonus points and climb the speed leaderboard.',
      status: 'coming-soon' as const,
      gradient: 'from-blue-600/20 to-cyan-600/20'
    },
    {
      icon: <Users className="w-6 h-6 text-green-400" />,
      title: 'Multiplayer Battles',
      description: 'Challenge friends in real-time! See who knows Reddit better in head-to-head matches.',
      status: 'coming-soon' as const,
      gradient: 'from-green-600/20 to-emerald-600/20'
    },
    {
      icon: <Target className="w-6 h-6 text-red-400" />,
      title: 'Daily Challenges',
      description: 'Special themed challenges every day. Complete them for exclusive badges and rewards.',
      status: 'coming-soon' as const,
      gradient: 'from-red-600/20 to-pink-600/20'
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      title: 'AI Difficulty Scaling',
      description: 'Smart AI adjusts question difficulty based on your performance for the perfect challenge.',
      status: 'coming-soon' as const,
      gradient: 'from-purple-600/20 to-indigo-600/20'
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-orange-400" />,
      title: 'Comment Reactions',
      description: 'React to comments with emojis and see what the community thinks about each post.',
      status: 'available' as const,
      gradient: 'from-orange-600/20 to-yellow-600/20'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-teal-400" />,
      title: 'Performance Analytics',
      description: 'Detailed stats on your accuracy by subreddit, improvement over time, and weak spots.',
      status: 'coming-soon' as const,
      gradient: 'from-teal-600/20 to-cyan-600/20'
    },
    {
      icon: <Award className="w-6 h-6 text-yellow-400" />,
      title: 'Achievement System',
      description: 'Unlock badges for milestones: Perfect games, subreddit specialist, roast survivor, and more!',
      status: 'coming-soon' as const,
      gradient: 'from-yellow-600/20 to-orange-600/20'
    },
    {
      icon: <Star className="w-6 h-6 text-pink-400" />,
      title: 'Custom Subreddit Packs',
      description: 'Create and share custom question packs focused on specific subreddits or themes.',
      status: 'premium' as const,
      gradient: 'from-pink-600/20 to-rose-600/20'
    },
    {
      icon: <Clock className="w-6 h-6 text-indigo-400" />,
      title: 'Streak System',
      description: 'Build daily play streaks for bonus XP and exclusive rewards. Don\'t break the chain!',
      status: 'coming-soon' as const,
      gradient: 'from-indigo-600/20 to-purple-600/20'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
      title: 'Community Stats',
      description: 'See global statistics: most difficult subreddits, average scores, and trending comments.',
      status: 'available' as const,
      gradient: 'from-emerald-600/20 to-green-600/20'
    },
    {
      icon: <Gamepad2 className="w-6 h-6 text-blue-400" />,
      title: 'Tournament Mode',
      description: 'Weekly tournaments with elimination rounds. Compete for the ultimate Reddit champion title!',
      status: 'premium' as const,
      gradient: 'from-blue-600/20 to-indigo-600/20'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-violet-400" />,
      title: 'AI Commentary',
      description: 'Get personalized commentary on your gameplay style and tips for improvement from our AI.',
      status: 'premium' as const,
      gradient: 'from-violet-600/20 to-purple-600/20'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          Exciting Features
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Discover all the ways to make your Reddit guessing experience more engaging, competitive, and fun!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-4">Want to see a feature implemented?</h3>
          <p className="text-gray-300 mb-6">
            Vote on which features you'd like to see next, or suggest your own ideas!
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105">
            Submit Feature Request
          </button>
        </div>
      </div>
    </div>
  );
}