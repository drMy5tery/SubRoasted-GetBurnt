import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface Comment {
  id: string;
  text: string;
  subreddit: string;
  score: number;
  author: string;
}

interface GameState {
  currentComment: Comment | null;
  correctSubreddit: string;
  optionsList: string[];
  score: number;
  totalQuestions: number;
  roastMessage: string;
  audioURL: string;
  cringeRating: number;
  gameStarted: boolean;
  loading: boolean;
  playerName: string;
}

type GameAction =
  | { type: 'SET_COMMENT'; payload: Comment }
  | { type: 'SET_OPTIONS'; payload: string[] }
  | { type: 'INCREMENT_SCORE' }
  | { type: 'SET_ROAST'; payload: string }
  | { type: 'SET_AUDIO_URL'; payload: string }
  | { type: 'SET_CRINGE_RATING'; payload: number }
  | { type: 'START_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'NEXT_QUESTION' };

const initialState: GameState = {
  currentComment: null,
  correctSubreddit: '',
  optionsList: [],
  score: 0,
  totalQuestions: 0,
  roastMessage: '',
  audioURL: '',
  cringeRating: 0,
  gameStarted: false,
  loading: false,
  playerName: '',
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_COMMENT':
      return { ...state, currentComment: action.payload, correctSubreddit: action.payload.subreddit };
    case 'SET_OPTIONS':
      return { ...state, optionsList: action.payload };
    case 'INCREMENT_SCORE':
      return { ...state, score: state.score + 1 };
    case 'SET_ROAST':
      return { ...state, roastMessage: action.payload };
    case 'SET_AUDIO_URL':
      return { ...state, audioURL: action.payload };
    case 'SET_CRINGE_RATING':
      return { ...state, cringeRating: action.payload };
    case 'START_GAME':
      return { ...state, gameStarted: true, score: 0, totalQuestions: 0 };
    case 'RESET_GAME':
      return { ...initialState };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PLAYER_NAME':
      return { ...state, playerName: action.payload };
    case 'NEXT_QUESTION':
      return { ...state, totalQuestions: state.totalQuestions + 1, roastMessage: '', audioURL: '', cringeRating: 0 };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}