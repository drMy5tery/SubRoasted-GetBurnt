import React from 'react'
import { useGame } from '../contexts/GameContext'
import StartScreen from './StartScreen'
import GameScreen from './GameScreen'
import ResultsScreen from './ResultsScreen'

const GameInterface = () => {
  const { state } = useGame()

  if (!state.gameStarted) {
    return <StartScreen />
  }

  if (state.gameCompleted) {
    return <ResultsScreen />
  }

  return <GameScreen />
}

export default GameInterface