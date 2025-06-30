import React, { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import { ChevronRight, Clock } from 'lucide-react'

const GameScreen = () => {
  const { state, dispatch } = useGame()
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = state.questions[state.currentQuestion]
  const progress = ((state.currentQuestion + 1) / state.totalQuestions) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    dispatch({ type: 'ANSWER_QUESTION', answerIndex })
    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (state.currentQuestion + 1 >= state.totalQuestions) {
      dispatch({ type: 'COMPLETE_GAME' })
    } else {
      dispatch({ type: 'NEXT_QUESTION' })
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        handleNextQuestion()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showResult])

  if (!currentQuestion) return null

  const correctAnswerIndex = currentQuestion.options.findIndex(
    option => option === currentQuestion.correctAnswer
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {state.currentQuestion + 1} of {state.totalQuestions}
            </span>
            <span className="text-sm font-medium text-gray-600">
              Score: {state.score}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Which subreddit did this comment come from?
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-800 italic">"{currentQuestion.comment}"</p>
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 "
            
            if (selectedAnswer === null) {
              buttonClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            } else if (index === correctAnswerIndex) {
              buttonClass += "border-green-500 bg-green-50 text-green-800"
            } else if (index === selectedAnswer && index !== correctAnswerIndex) {
              buttonClass += "border-red-500 bg-red-50 text-red-800"
            } else {
              buttonClass += "border-gray-200 bg-gray-50 text-gray-500"
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">r/{option}</span>
                  {showResult && index === correctAnswerIndex && (
                    <span className="text-green-600 font-semibold">✓ Correct</span>
                  )}
                  {showResult && index === selectedAnswer && index !== correctAnswerIndex && (
                    <span className="text-red-600 font-semibold">✗ Wrong</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Next Button (shown after answer) */}
        {showResult && (
          <div className="flex justify-center">
            <button
              onClick={handleNextQuestion}
              className="btn-primary flex items-center gap-2"
            >
              {state.currentQuestion + 1 >= state.totalQuestions ? 'View Results' : 'Next Question'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameScreen