import { Devvit, useState } from '@devvit/public-api';

// Configure Devvit
Devvit.configure({
  redditAPI: true,
  redis: true,
  http: true,
});

// Popular subreddits for the game
const POPULAR_SUBREDDITS = [
  'AskReddit', 'funny', 'gaming', 'todayilearned', 'pics', 'worldnews',
  'aww', 'Music', 'movies', 'science', 'food', 'relationships',
  'mildlyinteresting', 'LifeProTips', 'explainlikeimfive', 'Showerthoughts',
  'cats', 'dogs', 'programming', 'technology', 'cooking', 'fitness'
];

interface GameComment {
  text: string;
  subreddit: string;
  author: string;
  score: number;
}

interface GameState {
  currentQuestion: number;
  score: number;
  totalQuestions: number;
  gameStarted: boolean;
  gameEnded: boolean;
  currentComment: GameComment | null;
  options: string[];
  selectedAnswer: string | null;
  showResult: boolean;
  username: string;
}

// Add menu action for moderators to create game posts
Devvit.addMenuItem({
  label: 'Create Guess That Comment Game',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    
    const subreddit = await reddit.getCurrentSubreddit();
    
    await reddit.submitPost({
      title: '🎯 Guess That Comment - Test Your Reddit Knowledge!',
      text: 'Think you know Reddit? Test your skills by guessing which subreddit these comments came from!\n\nClick below to start playing and see how well you know the different communities on Reddit.',
      subredditName: subreddit.name,
    });
    
    ui.showToast('Game post created successfully!');
  },
});

// Main app component
const App: Devvit.CustomPostComponent = (context) => {
  const { reddit, redis, ui } = context;
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    totalQuestions: 10,
    gameStarted: false,
    gameEnded: false,
    currentComment: null,
    options: [],
    selectedAnswer: null,
    showResult: false,
    username: '',
  });

  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Array<{username: string, score: number, accuracy: number}>>([]);

  // Fetch a random comment from Reddit
  const fetchRandomComment = async (): Promise<GameComment | null> => {
    try {
      const randomSubreddit = POPULAR_SUBREDDITS[Math.floor(Math.random() * POPULAR_SUBREDDITS.length)];
      
      const posts = await reddit.getHotPosts({
        subredditName: randomSubreddit,
        limit: 25,
      }).all();

      for (const post of posts) {
        try {
          const comments = await reddit.getComments({
            postId: post.id,
            limit: 50,
          }).all();

          const goodComments = comments.filter(comment => 
            comment.body &&
            comment.body.length > 50 &&
            comment.body.length < 400 &&
            comment.score > 1 &&
            !comment.body.includes('http') &&
            !comment.body.includes('[deleted]') &&
            !comment.body.includes('[removed]')
          );

          if (goodComments.length > 0) {
            const randomComment = goodComments[Math.floor(Math.random() * goodComments.length)];
            return {
              text: randomComment.body,
              subreddit: randomSubreddit,
              author: randomComment.authorName || 'Anonymous',
              score: randomComment.score,
            };
          }
        } catch (error) {
          console.error('Error fetching comments:', error);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching random comment:', error);
      return null;
    }
  };

  // Generate multiple choice options
  const generateOptions = (correctSubreddit: string): string[] => {
    const wrongOptions = POPULAR_SUBREDDITS
      .filter(sub => sub !== correctSubreddit)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [...wrongOptions, correctSubreddit];
    return allOptions.sort(() => Math.random() - 0.5);
  };

  // Start the game
  const startGame = async () => {
    if (!gameState.username.trim()) {
      ui.showToast('Please enter a username first!');
      return;
    }

    setLoading(true);
    const comment = await fetchRandomComment();
    
    if (!comment) {
      ui.showToast('Failed to load question. Please try again.');
      setLoading(false);
      return;
    }

    const options = generateOptions(comment.subreddit);
    
    setGameState({
      ...gameState,
      gameStarted: true,
      currentComment: comment,
      options,
      currentQuestion: 1,
    });
    setLoading(false);
  };

  // Handle answer selection
  const selectAnswer = async (answer: string) => {
    if (gameState.selectedAnswer || gameState.showResult) return;

    const isCorrect = answer === gameState.currentComment?.subreddit;
    const newScore = isCorrect ? gameState.score + 1 : gameState.score;

    setGameState({
      ...gameState,
      selectedAnswer: answer,
      showResult: true,
      score: newScore,
    });

    // Auto-advance after 2 seconds
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // Move to next question
  const nextQuestion = async () => {
    if (gameState.currentQuestion >= gameState.totalQuestions) {
      // Game ended
      await saveScore();
      setGameState({
        ...gameState,
        gameEnded: true,
      });
      return;
    }

    setLoading(true);
    const comment = await fetchRandomComment();
    
    if (!comment) {
      ui.showToast('Failed to load next question.');
      setLoading(false);
      return;
    }

    const options = generateOptions(comment.subreddit);
    
    setGameState({
      ...gameState,
      currentQuestion: gameState.currentQuestion + 1,
      currentComment: comment,
      options,
      selectedAnswer: null,
      showResult: false,
    });
    setLoading(false);
  };

  // Save score to Redis
  const saveScore = async () => {
    try {
      const accuracy = Math.round((gameState.score / gameState.totalQuestions) * 100);
      const scoreData = {
        username: gameState.username,
        score: gameState.score,
        totalQuestions: gameState.totalQuestions,
        accuracy,
        timestamp: Date.now(),
      };

      await redis.zAdd('leaderboard', {
        member: JSON.stringify(scoreData),
        score: gameState.score,
      });

      // Keep only top 100 scores
      await redis.zRemRangeByRank('leaderboard', 0, -101);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const scores = await redis.zRange('leaderboard', 0, 9, { reverse: true });
      const leaderboardData = scores.map(score => JSON.parse(score.member));
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      totalQuestions: 10,
      gameStarted: false,
      gameEnded: false,
      currentComment: null,
      options: [],
      selectedAnswer: null,
      showResult: false,
      username: '',
    });
  };

  // Render main menu
  if (!gameState.gameStarted) {
    return (
      <vstack gap="large" padding="large" alignment="center middle">
        <text size="xxlarge" weight="bold" color="primary">
          🎯 Guess That Comment
        </text>
        <text size="medium" color="secondary" alignment="center">
          Test your Reddit knowledge! Can you guess which subreddit these comments came from?
        </text>
        
        <vstack gap="medium" width="100%">
          <text size="medium" weight="bold">Enter your username:</text>
          <textField
            placeholder="Your username"
            value={gameState.username}
            onTextChange={(value) => setGameState({...gameState, username: value})}
          />
          <button
            appearance="primary"
            size="large"
            onPress={startGame}
            disabled={loading || !gameState.username.trim()}
          >
            {loading ? 'Loading...' : 'Start Game'}
          </button>
        </vstack>

        <vstack gap="medium" width="100%">
          <text size="large" weight="bold">🏆 Leaderboard</text>
          <button
            appearance="secondary"
            onPress={loadLeaderboard}
          >
            View Top Players
          </button>
          {leaderboard.length > 0 && (
            <vstack gap="small">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <hstack key={index} gap="medium" alignment="center middle">
                  <text size="medium" weight="bold">#{index + 1}</text>
                  <text size="medium">{entry.username}</text>
                  <text size="medium" color="primary">{entry.score} pts</text>
                  <text size="small" color="secondary">{entry.accuracy}%</text>
                </hstack>
              ))}
            </vstack>
          )}
        </vstack>
      </vstack>
    );
  }

  // Render game over screen
  if (gameState.gameEnded) {
    const accuracy = Math.round((gameState.score / gameState.totalQuestions) * 100);
    return (
      <vstack gap="large" padding="large" alignment="center middle">
        <text size="xxlarge" weight="bold" color="primary">
          🎉 Game Over!
        </text>
        <vstack gap="medium" alignment="center">
          <text size="xlarge" weight="bold">
            Final Score: {gameState.score}/{gameState.totalQuestions}
          </text>
          <text size="large" color="secondary">
            Accuracy: {accuracy}%
          </text>
          <text size="medium" color="secondary">
            {accuracy >= 80 ? "🔥 Reddit Master!" : 
             accuracy >= 60 ? "👍 Pretty Good!" : 
             accuracy >= 40 ? "📚 Keep Learning!" : 
             "🤔 Better Luck Next Time!"}
          </text>
        </vstack>
        
        <hstack gap="medium">
          <button
            appearance="primary"
            onPress={resetGame}
          >
            Play Again
          </button>
          <button
            appearance="secondary"
            onPress={loadLeaderboard}
          >
            View Leaderboard
          </button>
        </hstack>
      </vstack>
    );
  }

  // Render game screen
  return (
    <vstack gap="large" padding="large">
      {/* Header */}
      <hstack gap="large" alignment="center middle">
        <text size="large" weight="bold">
          Question {gameState.currentQuestion}/{gameState.totalQuestions}
        </text>
        <text size="large" weight="bold" color="primary">
          Score: {gameState.score}
        </text>
      </hstack>

      {/* Progress bar */}
      <vstack gap="small">
        <text size="small" color="secondary">Progress</text>
        <hstack height="8px" width="100%" backgroundColor="neutral-background-weak">
          <spacer 
            width={`${(gameState.currentQuestion / gameState.totalQuestions) * 100}%`}
            backgroundColor="primary"
          />
        </hstack>
      </vstack>

      {loading ? (
        <vstack gap="medium" alignment="center middle">
          <text size="large">Loading next question...</text>
        </vstack>
      ) : (
        <vstack gap="large">
          {/* Question */}
          <vstack gap="medium">
            <text size="large" weight="bold">
              Which subreddit do you think this comment came from?
            </text>
            <vstack gap="small" padding="medium" backgroundColor="neutral-background-weak" cornerRadius="medium">
              <text size="medium" style="italic">
                "{gameState.currentComment?.text}"
              </text>
              <text size="small" color="secondary">
                - u/{gameState.currentComment?.author} • {gameState.currentComment?.score} upvotes
              </text>
            </vstack>
          </vstack>

          {/* Answer options */}
          <vstack gap="small">
            {gameState.options.map((option, index) => {
              let appearance: "primary" | "secondary" | "success" | "destructive" = "secondary";
              
              if (gameState.showResult) {
                if (option === gameState.currentComment?.subreddit) {
                  appearance = "success";
                } else if (option === gameState.selectedAnswer) {
                  appearance = "destructive";
                }
              }

              return (
                <button
                  key={index}
                  appearance={appearance}
                  size="large"
                  onPress={() => selectAnswer(option)}
                  disabled={gameState.showResult}
                >
                  r/{option}
                </button>
              );
            })}
          </vstack>

          {/* Result message */}
          {gameState.showResult && (
            <vstack gap="small" alignment="center">
              {gameState.selectedAnswer === gameState.currentComment?.subreddit ? (
                <text size="large" weight="bold" color="green">
                  ✅ Correct!
                </text>
              ) : (
                <text size="large" weight="bold" color="red">
                  ❌ Wrong! The correct answer was r/{gameState.currentComment?.subreddit}
                </text>
              )}
              <text size="small" color="secondary">
                Next question loading...
              </text>
            </vstack>
          )}
        </vstack>
      )}
    </vstack>
  );
};

// Register the custom post type
Devvit.addCustomPostType({
  name: 'Guess That Comment Game',
  height: 'tall',
  render: App,
});

export default Devvit;