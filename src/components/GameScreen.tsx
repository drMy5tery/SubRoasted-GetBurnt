import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ArrowRight, Home, Volume2, Heart, Meh, Frown, Angry, Skull, AlertCircle, VolumeX } from 'lucide-react';
import { generateComment, generateRoast, generateSpeech, generateMultipleChoiceOptions, saveCringeRating, saveScore } from '../services/api';

export default function GameScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [error, setError] = useState<string>('');
  const [isGeneratingRoast, setIsGeneratingRoast] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roastPlayCount, setRoastPlayCount] = useState(0);
  const [spamClickCount, setSpamClickCount] = useState(0);
  const [currentRoastLevel, setCurrentRoastLevel] = useState(1);
  const [wrongGuess, setWrongGuess] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!state.gameStarted) {
      navigate('/');
      return;
    }
    loadNewQuestion();
  }, []);

  // Cleanup audio when component unmounts or question changes
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [state.totalQuestions]);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current.load(); // Force cleanup
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const loadNewQuestion = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    setError('');
    
    // Stop any playing audio when loading new question
    cleanupAudio();
    setRoastPlayCount(0);
    setSpamClickCount(0);
    setCurrentRoastLevel(1);
    setWrongGuess('');
    
    try {
      // Fetch real Reddit comment
      const comment = await generateComment();
      dispatch({ type: 'SET_COMMENT', payload: comment });
      
      // Generate multiple choice options
      const options = generateMultipleChoiceOptions(comment.subreddit);
      dispatch({ type: 'SET_OPTIONS', payload: options });
    } catch (error) {
      console.error('Error loading question:', error);
      setError('Failed to load Reddit comments. Please check your internet connection and Reddit API configuration.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === state.correctSubreddit;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      dispatch({ type: 'INCREMENT_SCORE' });
    } else {
      setWrongGuess(answer);
      // Generate and play roast for wrong answers (this is the 1st API call)
      setIsGeneratingRoast(true);
      try {
        const roast = await generateRoast(
          state.currentComment?.text || '', 
          answer, 
          state.correctSubreddit,
          1 // Initial roast level
        );
        dispatch({ type: 'SET_ROAST', payload: roast });
        setCurrentRoastLevel(1);
        
        // Generate speech for the roast (but it will return empty string)
        setIsGeneratingSpeech(true);
        const audioUrl = await generateSpeech(roast);
        if (audioUrl && audioUrl.length > 0) {
          dispatch({ type: 'SET_AUDIO_URL', payload: audioUrl });
          // Audio functionality is disabled, so we just simulate it
          setIsPlaying(false);
        }
      } catch (error) {
        console.error('Error generating roast:', error);
        dispatch({ type: 'SET_ROAST', payload: "Well, that wasn't right! Better luck next time." });
      } finally {
        setIsGeneratingRoast(false);
        setIsGeneratingSpeech(false);
      }
    }
  };

  const handleNextQuestion = async () => {
    // Save score if this is the end of the game (you can modify this logic)
    if (state.totalQuestions >= 9) { // End game after 10 questions
      try {
        await saveScore(state.playerName, state.score, state.totalQuestions + 1);
        navigate('/leaderboard');
        return;
      } catch (error) {
        console.error('Error saving final score:', error);
      }
    }

    // Clean up audio completely
    cleanupAudio();

    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setError('');
    dispatch({ type: 'NEXT_QUESTION' });
    loadNewQuestion();
  };

  const handleCringeRating = async (rating: number) => {
    dispatch({ type: 'SET_CRINGE_RATING', payload: rating });
    
    // Save cringe rating to database
    if (state.currentComment) {
      try {
        await saveCringeRating(state.currentComment.id, rating, state.playerName);
      } catch (error) {
        console.error('Error saving cringe rating:', error);
      }
    }
  };

  const getCringeIcon = (rating: number) => {
    switch (rating) {
      case 0: return <Heart className="w-5 h-5" />;
      case 1: return <Meh className="w-5 h-5" />;
      case 2: return <Frown className="w-5 h-5" />;
      case 3: return <Angry className="w-5 h-5" />;
      case 4: return <Skull className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const getCringeLabel = (rating: number) => {
    switch (rating) {
      case 0: return 'Wholesome';
      case 1: return 'Normal';
      case 2: return 'Awkward';
      case 3: return 'Cringe';
      case 4: return 'Maximum Cringe';
      default: return 'Rate it';
    }
  };

  const getPlayButtonText = () => {
    if (spamClickCount >= 100) {
      return "Stop It Get Some Help - Michael Jordan (England America President) 🏀";
    }
    if (spamClickCount >= 85) {
      return "Still you Got no Child Support 💸";
    }
    if (spamClickCount >= 65) {
      return "And Yet you were Adopted 👶";
    }
    if (spamClickCount >= 50) {
      return "No Wonder Your Parents got Divorced 💔";
    }
    if (spamClickCount >= 35) {
      return "Bro Touch Some Grass 🌱";
    }
    if (spamClickCount >= 20) {
      return "Bruhh!!! Get A Life 😤";
    }
    if (roastPlayCount >= 4) {
      return "You're Burnt AF 🔥";
    }
    if (roastPlayCount >= 3) {
      return "Wanna Get Cooked Again? 🍳";
    }
    if (roastPlayCount >= 2) {
      return "Get Cooked Again? 🔥";
    }
    // Initial button - this will make the 2nd API call (roast level 2)
    return "Play Roast Again 🎵";
  };

  const getPlayButtonStyle = () => {
    if (spamClickCount >= 100) {
      return "text-white bg-purple-700 border-purple-500 cursor-not-allowed text-xs font-bold px-4 py-3";
    }
    if (spamClickCount >= 85) {
      return "text-white bg-pink-700 border-pink-500 cursor-not-allowed text-sm font-bold px-4 py-3";
    }
    if (spamClickCount >= 65) {
      return "text-white bg-indigo-700 border-indigo-500 cursor-not-allowed text-sm font-bold px-4 py-3";
    }
    if (spamClickCount >= 50) {
      return "text-white bg-red-700 border-red-500 cursor-not-allowed text-sm font-bold px-4 py-3";
    }
    if (spamClickCount >= 35) {
      return "text-white bg-green-700 border-green-500 cursor-not-allowed text-sm font-bold px-4 py-3";
    }
    if (spamClickCount >= 20) {
      return "text-white bg-yellow-700 border-yellow-500 cursor-not-allowed text-sm font-bold px-4 py-3";
    }
    if (roastPlayCount >= 4) {
      return "text-white bg-orange-700 border-orange-500 cursor-not-allowed text-sm font-bold px-4 py-3";
    }
    return "text-white bg-blue-700 hover:bg-blue-600 border-blue-500 hover:border-blue-400 text-sm font-bold px-4 py-3";
  };

  const handlePlayRoast = async () => {
    // Handle spam clicks after 4 roast plays
    if (roastPlayCount >= 4) {
      setSpamClickCount(prev => prev + 1);
      return;
    }

    // Always make API call for the first 4 clicks
    // roastPlayCount starts at 0, so:
    // - 1st click (roastPlayCount = 0): API call with level 2
    // - 2nd click (roastPlayCount = 1): API call with level 3  
    // - 3rd click (roastPlayCount = 2): API call with level 4
    // - 4th click (roastPlayCount = 3): API call with level 5 (but we cap at 4)
    setIsGeneratingRoast(true);
    setIsGeneratingSpeech(true);
    
    try {
      const nextRoastLevel = roastPlayCount + 2; // Start from level 2 since level 1 was automatic
      const newRoast = await generateRoast(
        state.currentComment?.text || '', 
        wrongGuess, 
        state.correctSubreddit,
        Math.min(nextRoastLevel, 4) // Cap at level 4
      );
      
      dispatch({ type: 'SET_ROAST', payload: newRoast });
      setCurrentRoastLevel(Math.min(nextRoastLevel, 4));
      
      // Generate new speech (but it will return empty string)
      const audioUrl = await generateSpeech(newRoast);
      if (audioUrl && audioUrl.length > 0) {
        dispatch({ type: 'SET_AUDIO_URL', payload: audioUrl });
        // Audio functionality is disabled
      }
      
      setRoastPlayCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Error generating new roast:', error);
    } finally {
      setIsGeneratingRoast(false);
      setIsGeneratingSpeech(false);
    }
  };

  const stopAudio = () => {
    // Audio functionality is disabled, but keep the button for UI consistency
    setIsPlaying(false);
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Fetching fresh Reddit content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Connection Error</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={loadNewQuestion}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white hover:text-blue-400 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Home
          </button>
          <div className="text-center">
            <p className="text-white font-semibold">{state.playerName}</p>
            <p className="text-gray-300 text-sm">Score: {state.score}/{state.totalQuestions + 1}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">Question {state.totalQuestions + 1}/10</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Comment Display */}
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 mb-6 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Guess the Subreddit!</h2>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="text-white text-lg leading-relaxed">
              "{state.currentComment?.text || 'Loading comment...'}"
            </p>
            {state.currentComment && (
              <div className="mt-4 text-gray-400 text-sm">
                By u/{state.currentComment.author} • {state.currentComment.score} upvotes
              </div>
            )}
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {state.optionsList.map((option, index) => (
            <button
              key={option}
              onClick={() => !showResult && handleAnswerSelect(option)}
              disabled={showResult}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                showResult
                  ? option === state.correctSubreddit
                    ? 'bg-green-500/20 border-green-500 text-green-300'
                    : option === selectedAnswer
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-white/5 border-white/10 text-gray-400'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-blue-500 transform hover:scale-105'
              }`}
            >
              <div className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold mr-4">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-lg font-semibold">r/{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Result Section */}
        {showResult && (
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 mb-6 shadow-2xl border border-white/20">
            <div className="text-center mb-6">
              <h3 className={`text-3xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
              </h3>
              <p className="text-white text-lg">
                The correct answer was <span className="font-bold text-blue-400">r/{state.correctSubreddit}</span>
              </p>
            </div>

            {/* Roast Message */}
            {!isCorrect && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
                <h4 className="text-red-400 font-bold mb-2 flex items-center">
                  🔥 AI Roast:
                  {isGeneratingRoast && (
                    <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                  )}
                </h4>
                
                {isGeneratingRoast ? (
                  <p className="text-gray-300 italic">Generating your personalized roast...</p>
                ) : state.roastMessage ? (
                  <>
                    <p className="text-white italic mb-4">"{state.roastMessage}"</p>
                    
                    {/* Audio Controls */}
                    <div className="flex items-center gap-4">
                      {isGeneratingSpeech ? (
                        <div className="flex items-center text-blue-400">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                          Generating speech...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={handlePlayRoast}
                            disabled={isPlaying || (roastPlayCount >= 4 && spamClickCount >= 100)}
                            className={`flex items-center transition-all duration-200 rounded-lg border ${getPlayButtonStyle()}`}
                          >
                            <Volume2 className="w-4 h-4 mr-2" />
                            <span className="font-medium">
                              {isPlaying ? 'Playing...' : getPlayButtonText()}
                            </span>
                          </button>
                          
                          {isPlaying && (
                            <button
                              onClick={stopAudio}
                              className="flex items-center text-white transition-colors px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-500 text-sm font-bold"
                            >
                              <VolumeX className="w-4 h-4 mr-2" />
                              <span>Stop</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-300 italic">🤖 Add your Groq API key to get roasted!</p>
                )}
              </div>
            )}

            {/* Cringe Rating */}
            <div className="text-center mb-6">
              <p className="text-white font-semibold mb-3">Rate this comment's cringe level:</p>
              <div className="flex justify-center space-x-4">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleCringeRating(rating)}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      state.cringeRating === rating
                        ? 'bg-purple-500 text-white transform scale-110'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:scale-105'
                    }`}
                    title={getCringeLabel(rating)}
                  >
                    {getCringeIcon(rating)}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-gray-400 text-sm">
                💖 Wholesome → 💀 Maximum Cringe
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleNextQuestion}
                className="flex items-center justify-center mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                {state.totalQuestions >= 9 ? 'Finish Game' : 'Next Question'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}