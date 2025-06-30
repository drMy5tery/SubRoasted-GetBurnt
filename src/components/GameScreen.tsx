import React, { useState, useEffect } from 'react';
import { Clock, Star, Target, ArrowRight } from 'lucide-react';
import { Question } from '../types';
import { generateMockQuestions } from '../lib/mockData';

interface GameScreenProps {
  onGameEnd: (score: number, totalQuestions: number, accuracy: number) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameEnd }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const mockQuestions = generateMockQuestions(10);
    setQuestions(mockQuestions);
    setGameStarted(true);
  }, []);

  useEffect(() => {
    if (!gameStarted || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, gameStarted, showResult]);

  const handleTimeUp = () => {
    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
      const accuracy = (score / questions.length) * 100;
      onGameEnd(score, questions.length, accuracy);
      return;
    }

    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(15);
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Target className="w-6 h-6 text-blue-400 mr-2" />
              <span className="text-white font-medium">Score: {score}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-6 h-6 text-yellow-400 mr-2" />
              <span className="text-white font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-red-400 mr-2" />
            <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-8">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Which subreddit do you think this comment came from?
          </h2>
          <div className="bg-white/20 rounded-lg p-6 border-l-4 border-blue-400">
            <p className="text-lg text-blue-100 italic">"{currentQuestion.comment.text}"</p>
            <p className="text-sm text-blue-300 mt-2">- u/{currentQuestion.comment.author}</p>
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = "w-full p-4 rounded-lg text-left font-medium transition-all duration-200 transform hover:scale-105 ";
            
            if (showResult) {
              if (option === currentQuestion.correctAnswer) {
                buttonClass += "bg-green-500 text-white border-2 border-green-400";
              } else if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
                buttonClass += "bg-red-500 text-white border-2 border-red-400";
              } else {
                buttonClass += "bg-white/20 text-blue-200 border border-white/30";
              }
            } else {
              buttonClass += "bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span>r/{option}</span>
                  {showResult && option === currentQuestion.correctAnswer && (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Result Message */}
        {showResult && (
          <div className="mt-6 text-center">
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <p className="text-2xl font-bold text-green-400">Correct! 🎉</p>
            ) : (
              <p className="text-2xl font-bold text-red-400">
                Wrong! The correct answer was r/{currentQuestion.correctAnswer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;