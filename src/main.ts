import { Devvit, useState } from '@devvit/public-api';

// Configure the app
Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type for the game
Devvit.addCustomPostType({
  name: 'Guess That Comment',
  height: 'tall',
  render: (context) => {
    const [gameState, setGameState] = useState({
      currentComment: null,
      options: [],
      score: 0,
      totalQuestions: 0,
      gameStarted: false,
      showResult: false,
      selectedAnswer: '',
      correctAnswer: '',
      playerName: context.userId || 'Anonymous',
      roastMessage: '',
    });

    const [loading, setLoading] = useState(false);

    // Popular subreddits for the game
    const POPULAR_SUBREDDITS = [
      'AskReddit', 'funny', 'todayilearned', 'explainlikeimfive',
      'LifeProTips', 'Showerthoughts', 'mildlyinteresting', 'tifu',
      'AmItheAsshole', 'relationships', 'programming', 'technology',
      'science', 'movies', 'gaming', 'food', 'cats', 'dogs'
    ];

    // Generate multiple choice options
    const generateOptions = (correctSubreddit: string): string[] => {
      const availableOptions = POPULAR_SUBREDDITS.filter(sub => sub !== correctSubreddit);
      const shuffledOptions = availableOptions.sort(() => Math.random() - 0.5);
      const fakeOptions = shuffledOptions.slice(0, 3);
      const allOptions = [...fakeOptions, correctSubreddit];
      return allOptions.sort(() => Math.random() - 0.5);
    };

    // Fetch a random comment from Reddit
    const fetchRandomComment = async () => {
      try {
        setLoading(true);
        
        // Get a random subreddit
        const randomSubreddit = POPULAR_SUBREDDITS[Math.floor(Math.random() * POPULAR_SUBREDDITS.length)];
        
        // Fetch hot posts from the subreddit
        const posts = await context.reddit.getHotPosts({
          subredditName: randomSubreddit,
          limit: 25,
        });

        // Find a post with comments
        for (const post of posts) {
          if (post.numComments > 0) {
            const comments = await context.reddit.getComments({
              postId: post.id,
              limit: 50,
            });

            // Filter for good comments
            const goodComments = comments.filter(comment => 
              comment.body &&
              comment.body.length > 50 &&
              comment.body.length < 400 &&
              comment.score > 0 &&
              !comment.body.includes('http') &&
              !comment.body.includes('[deleted]') &&
              !comment.body.includes('[removed]')
            );

            if (goodComments.length > 0) {
              const randomComment = goodComments[Math.floor(Math.random() * goodComments.length)];
              
              const options = generateOptions(randomSubreddit);
              
              setGameState(prev => ({
                ...prev,
                currentComment: {
                  id: randomComment.id,
                  text: randomComment.body,
                  subreddit: randomSubreddit,
                  score: randomComment.score,
                  author: randomComment.authorName,
                },
                options,
                correctAnswer: randomSubreddit,
                showResult: false,
                selectedAnswer: '',
                roastMessage: '',
              }));
              
              setLoading(false);
              return;
            }
          }
        }
        
        throw new Error('No suitable comments found');
      } catch (error) {
        console.error('Error fetching comment:', error);
        setLoading(false);
        // Could add fallback mock comments here
      }
    };

    // Handle answer selection
    const handleAnswerSelect = async (answer: string) => {
      const isCorrect = answer === gameState.correctAnswer;
      
      setGameState(prev => ({
        ...prev,
        selectedAnswer: answer,
        showResult: true,
        score: isCorrect ? prev.score + 1 : prev.score,
      }));

      // Generate roast for wrong answers (simplified for Devvit)
      if (!isCorrect) {
        const roasts = [
          `Really? You thought that belonged in r/${answer}? That's about as accurate as a weather forecast!`,
          `Oh honey, guessing r/${answer} is like bringing a spoon to a knife fight.`,
          `I've seen GPS systems with better navigation than your guess of r/${answer}.`,
        ];
        
        setGameState(prev => ({
          ...prev,
          roastMessage: roasts[Math.floor(Math.random() * roasts.length)],
        }));
      }
    };

    // Start new game
    const startGame = () => {
      setGameState(prev => ({
        ...prev,
        gameStarted: true,
        score: 0,
        totalQuestions: 0,
      }));
      fetchRandomComment();
    };

    // Next question
    const nextQuestion = () => {
      if (gameState.totalQuestions >= 9) {
        // End game - could save score to Redis here
        setGameState(prev => ({
          ...prev,
          gameStarted: false,
        }));
        return;
      }
      
      setGameState(prev => ({
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
      }));
      fetchRandomComment();
    };

    // Render the game UI
    if (!gameState.gameStarted) {
      return (
        <vstack alignment="center middle" padding="large" gap="medium">
          <text size="xxlarge" weight="bold" color="primary">
            🎯 Guess That Comment
          </text>
          <text size="medium" color="secondary" alignment="center">
            Test your Reddit knowledge by guessing which subreddit a comment came from!
          </text>
          <text size="small" color="secondary" alignment="center">
            Get roasted by AI when you're wrong! 🔥
          </text>
          <button onPress={startGame} appearance="primary" size="large">
            Start Playing
          </button>
        </vstack>
      );
    }

    if (loading) {
      return (
        <vstack alignment="center middle" padding="large">
          <text size="large">Loading fresh Reddit content...</text>
        </vstack>
      );
    }

    if (!gameState.currentComment) {
      return (
        <vstack alignment="center middle" padding="large">
          <text size="large" color="critical">Failed to load comment</text>
          <button onPress={fetchRandomComment} appearance="secondary">
            Try Again
          </button>
        </vstack>
      );
    }

    return (
      <vstack padding="medium" gap="medium">
        {/* Header */}
        <hstack alignment="space-between">
          <text size="medium" weight="bold">
            Question {gameState.totalQuestions + 1}/10
          </text>
          <text size="medium">
            Score: {gameState.score}/{gameState.totalQuestions + 1}
          </text>
        </hstack>

        {/* Comment Display */}
        <vstack gap="small" padding="medium" backgroundColor="neutral-background-weak" cornerRadius="medium">
          <text size="large" weight="bold">
            Guess the Subreddit!
          </text>
          <text size="medium" wrap>
            "{gameState.currentComment.text}"
          </text>
          <text size="small" color="secondary">
            By u/{gameState.currentComment.author} • {gameState.currentComment.score} upvotes
          </text>
        </vstack>

        {/* Answer Options */}
        <vstack gap="small">
          {gameState.options.map((option, index) => (
            <button
              key={option}
              onPress={() => !gameState.showResult && handleAnswerSelect(option)}
              disabled={gameState.showResult}
              appearance={
                gameState.showResult
                  ? option === gameState.correctAnswer
                    ? 'success'
                    : option === gameState.selectedAnswer
                    ? 'destructive'
                    : 'secondary'
                  : 'secondary'
              }
              size="large"
            >
              {String.fromCharCode(65 + index)}. r/{option}
            </button>
          ))}
        </vstack>

        {/* Result Section */}
        {gameState.showResult && (
          <vstack gap="medium" padding="medium" backgroundColor="neutral-background-weak" cornerRadius="medium">
            <text size="large" weight="bold" color={gameState.selectedAnswer === gameState.correctAnswer ? 'success' : 'critical'}>
              {gameState.selectedAnswer === gameState.correctAnswer ? '🎉 Correct!' : '❌ Wrong!'}
            </text>
            <text size="medium">
              The correct answer was r/{gameState.correctAnswer}
            </text>
            
            {/* Roast Message */}
            {gameState.roastMessage && (
              <vstack gap="small" padding="medium" backgroundColor="critical-background-weak" cornerRadius="small">
                <text size="medium" weight="bold" color="critical">
                  🔥 AI Roast:
                </text>
                <text size="medium" style="italic">
                  "{gameState.roastMessage}"
                </text>
              </vstack>
            )}

            <button onPress={nextQuestion} appearance="primary" size="large">
              {gameState.totalQuestions >= 9 ? 'Finish Game' : 'Next Question'}
            </button>
          </vstack>
        )}
      </vstack>
    );
  },
});

// Add a menu action to create the game post
Devvit.addMenuItem({
  label: 'Create Guess That Comment Game',
  location: 'subreddit',
  onPress: async (_, context) => {
    const { reddit, ui } = context;
    
    const post = await reddit.submitPost({
      title: '🎯 Guess That Comment - Test Your Reddit Knowledge!',
      subredditName: context.subredditName,
      preview: (
        <vstack alignment="center middle" padding="large" gap="medium">
          <text size="xxlarge" weight="bold">🎯 Guess That Comment</text>
          <text size="medium" alignment="center">
            Test your Reddit knowledge by guessing which subreddit a comment came from!
          </text>
          <text size="small" color="secondary">
            Click to start playing!
          </text>
        </vstack>
      ),
    });

    ui.showToast({ text: 'Game created successfully!' });
  },
});

export default Devvit;