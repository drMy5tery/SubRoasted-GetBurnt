import React from 'react'
import { GameProvider } from './contexts/GameContext'
import GameInterface from './components/GameInterface'

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <GameInterface />
      </div>
    </GameProvider>
  )
}

export default App