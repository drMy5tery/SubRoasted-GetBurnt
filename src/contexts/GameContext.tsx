import React, { createContext, useContext, useReducer, ReactNode } from 'react'

interface GameState {
  currentQuestion: number
  score: number
  totalQuestions: number
  gameStarted: boolean
  gameCompleted: boolean
  username: string
  questions: Question[]
  selectedAnswers: number[]
}

interface Question {
  id: string
  comment: string
  correctAnswer: string
  options: string[]
}

type GameAction =
  | { type: 'START_GAME'; username: string; questions: Question[] }
  | { type: 'ANSWER_QUESTION'; answerIndex: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'COMPLETE_GAME' }
  | { type: 'RESET_GAME' }

const initialState: GameState = {
  currentQuestion: 0,
  score: 0,
  totalQuestions: 10,
  gameStarted: false,
  gameCompleted: false,
  username: '',
  questions: [],
  selectedAnswers: []
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        gameStarted: true,
        username: action.username,
        questions: action.questions,
        totalQuestions: action.questions.length
      }
    case 'ANSWER_QUESTION':
      const isCorrect = state.questions[state.currentQuestion]?.options[action.answerIndex] === 
                       state.questions[state.currentQuestion]?.correctAnswer
      return {
        ...state,
        score: isCorrect ? state.score + 1 : state.score,
        selectedAnswers: [...state.selectedAnswers, action.answerIndex]
      }
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: state.currentQuestion + 1
      }
    case 'COMPLETE_GAME':
      return {
        ...state,
        gameCompleted: true
      }
    case 'RESET_GAME':
      return initialState
    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
} | null>(null)

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}