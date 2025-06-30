import React, { useState } from 'react'
import { useGame } from '../contexts/GameContext'
import { generateMockQuestions } from '../utils/mockData'
import { Play, Trophy, Users } from 'lucide-react'

const StartScreen = () => {
  const [username, setUsername] = useState('')
  const { dispatch } = useGame()

  const handleStartGame = () => {
    if (username.trim()) {
      const questions = generateMockQuestions()
      dispatch({ type: 'START_GAME', username: username.trim(), questions })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Guess That Comment
          </h1>
          <p className="text-gray-600">
            Test your knowledge by guessing which subreddit a comment came from!
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-left">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
            />
          </div>

          <button
            onClick={handleStartGame}
            disabled={!username.trim()}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3"
          >
            Start Game
          </button>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">10 Questions</p>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Leaderboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartScreen