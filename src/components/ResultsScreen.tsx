import React, { useEffect, useState } from 'react'
import { useGame } from '../contexts/GameContext'
import { supabase } from '../lib/supabase'
import { Trophy, RotateCcw, Crown, Medal, Award } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  username: string
  score: number
  total_questions: number
  accuracy: number
  created_at: string
}

const ResultsScreen = () => {
  const { state, dispatch } = useGame()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const accuracy = Math.round((state.score / state.totalQuestions) * 100)

  useEffect(() => {
    saveScore()
    fetchLeaderboard()
  }, [])

  const saveScore = async () => {
    try {
      const { error } = await supabase
        .from('leaderboard')
        .insert({
          username: state.username,
          score: state.score,
          total_questions: state.totalQuestions,
          accuracy: accuracy
        })

      if (error) throw error
      setSaved(true)
    } catch (error) {
      console.error('Error saving score:', error)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .order('accuracy', { ascending: false })
        .limit(10)

      if (error) throw error
      setLeaderboard(data || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' })
  }

  const getScoreMessage = () => {
    if (accuracy >= 90) return "Outstanding! You're a Reddit expert! 🏆"
    if (accuracy >= 70) return "Great job! You know your subreddits! 🎉"
    if (accuracy >= 50) return "Not bad! Keep practicing! 👍"
    return "Better luck next time! 💪"
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />
      case 1: return <Medal className="w-5 h-5 text-gray-400" />
      case 2: return <Award className="w-5 h-5 text-amber-600" />
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{index + 1}</span>
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Results Card */}
        <div className="card text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Game Complete!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {getScoreMessage()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {state.score}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {accuracy}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {state.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
          </div>

          <button
            onClick={handlePlayAgain}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>

        {/* Leaderboard Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🏆 Leaderboard
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.username === state.username 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getRankIcon(index)}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {entry.username}
                        {entry.username === state.username && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.accuracy}% accuracy
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {entry.score}
                    </div>
                    <div className="text-sm text-gray-600">
                      /{entry.total_questions}
                    </div>
                  </div>
                </div>
              ))}
              
              {leaderboard.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  No scores yet. Be the first to play!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsScreen