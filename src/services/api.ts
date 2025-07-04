// Real API integrations for GuessThatComment

interface Comment {
  id: string;
  text: string;
  subreddit: string;
  score: number;
  author: string;
}

// Popular subreddits for generating fake options
const POPULAR_SUBREDDITS = [
  'AskReddit', 'funny', 'WTF', 'trees', 'AmItheAsshole', 'gaming', 
  'technology', 'todayilearned', 'pics', 'worldnews', 'aww', 'Music',
  'movies', 'science', 'food', 'relationships', 'unpopularopinion',
  'mildlyinteresting', 'LifeProTips', 'tifu', 'explainlikeimfive',
  'dataisbeautiful', 'politics', 'Showerthoughts', 'memes', 'dankmemes',
  'wholesomememes', 'cats', 'dogs', 'programming', 'learnprogramming'
];

export async function generateComment(): Promise<Comment> {
  try {
    const { redditClient } = await import('./reddit-api');
    const comment = await redditClient.fetchRandomComment();
    return comment;
  } catch (error) {
    console.error('Reddit API failed:', error);
    // This error should not occur now since reddit-api.ts has fallback system
    throw new Error('Unable to fetch comments. Please try again.');
  }
}

export function generateMultipleChoiceOptions(correctSubreddit: string): string[] {
  // Remove the correct subreddit from the list
  const availableOptions = POPULAR_SUBREDDITS.filter(sub => sub !== correctSubreddit);
  
  // Shuffle and pick 3 fake options
  const shuffledOptions = availableOptions.sort(() => Math.random() - 0.5);
  const fakeOptions = shuffledOptions.slice(0, 3);
  
  // Combine with correct answer and shuffle again
  const allOptions = [...fakeOptions, correctSubreddit];
  return allOptions.sort(() => Math.random() - 0.5);
}

export async function generateRoast(comment: string, wrongGuess: string, correctAnswer: string, userClickLevel: number = 1): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('Groq API key not configured');
    }
    
    let prompt = '';
    let systemPrompt = '';
    
    switch (userClickLevel) {
      case 1:
        // First user click (2nd API call) - user clicked "Play Roast Again"
        prompt = `This person just clicked "Play Roast Again" after getting roasted for guessing wrong. They want to hear their roast again! Roast them for being a masochist who enjoys getting burned. Make it funny and sarcastic about why they're replaying their own roast.`;
        systemPrompt = 'You are a sarcastic AI roasting someone for wanting to hear their roast again. Be witty about their masochistic tendencies.';
        break;
        
      case 2:
        // Second user click (3rd API call) - "Get Cooked Again?"
        prompt = `This person has now clicked the roast button 2 times! They clearly enjoy getting roasted. Make fun of them for being addicted to getting burned and coming back for more punishment. Be sarcastic about their apparent love for digital abuse.`;
        systemPrompt = 'You are roasting someone who keeps coming back for more roasts. They clearly love getting burned. Be sarcastic about their addiction to getting roasted.';
        break;
        
      case 3:
        // Third user click (4th API call) - "Wanna Get Cooked Again?"
        prompt = `This person has clicked the roast button 3 times now! They are completely burnt and still asking for more. Give them the ultimate final roast about being absolutely destroyed and still coming back. Make it the most savage but funny roast yet.`;
        systemPrompt = 'You are delivering the final, most savage roast to someone who has been completely destroyed but keeps coming back. Make it epic and final.';
        break;
        
      default:
        // Initial roast (1st API call) - automatic after wrong guess
        prompt = `Roast someone who guessed "${wrongGuess}" when the correct subreddit was "${correctAnswer}". Make it funny, sarcastic, and Reddit-style. Keep it under 100 words and make it playful and witty with a lot of passive aggressiveness.`;
        systemPrompt = 'You are a witty, sarcastic AI that roasts people for wrong Reddit guesses. Be funny but not mean. Use Reddit slang and internet humor.';
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.9,
        top_p: 1,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('Error generating roast:', error);
    
    // Fallback roasts based on user click level
    const fallbackRoasts = {
      0: [
        `Really? You thought that comment belonged in r/${wrongGuess}? That's about as accurate as a weather forecast from a magic 8-ball.`,
        `Oh honey, guessing r/${wrongGuess} for that comment is like bringing a spoon to a knife fight - completely missing the point.`,
        `I've seen GPS systems with better navigation skills than your guess of r/${wrongGuess}. The correct answer was right there!`,
      ],
      1: [
        `Oh, you want to hear that roast again? Someone clearly enjoys the taste of their own digital destruction!`,
        `Clicking replay on your own roast? That's some next-level masochism right there!`,
        `You're really going back for seconds on that burn? Bold strategy, Cotton.`,
      ],
      2: [
        `Two clicks now? You're officially addicted to getting roasted. Should I call digital rehab?`,
        `At this point you're not getting roasted, you're getting slow-cooked to perfection!`,
        `Second time's the charm? More like second time's the self-inflicted digital abuse!`,
      ],
      3: [
        `THREE CLICKS?! You're not just burnt, you're charcoal at this point! There's nothing left to roast!`,
        `Congratulations, you've achieved maximum roast saturation. You're officially well-done!`,
        `You've been roasted so many times, Gordon Ramsay would be proud of how well-done you are!`,
      ]
    };
    
    const levelRoasts = fallbackRoasts[userClickLevel as keyof typeof fallbackRoasts] || fallbackRoasts[0];
    return levelRoasts[Math.floor(Math.random() * levelRoasts.length)];
  }
}

export async function generateSpeech(text: string): Promise<string> {
  // Temporarily disabled - return empty string to skip audio functionality
  console.log('Speech generation disabled - would have generated audio for:', text);
  return '';
}

export async function saveCringeRating(commentId: string, rating: number, username: string): Promise<void> {
  try {
    const { saveCringeRatingToSupabase } = await import('./supabase');
    await saveCringeRatingToSupabase(commentId, username, rating);
  } catch (error) {
    console.error('Error saving cringe rating:', error);
    // Don't throw - this is not critical functionality
  }
}

export async function saveScore(username: string, score: number, totalQuestions: number): Promise<void> {
  try {
    const { saveGameScore } = await import('./supabase');
    await saveGameScore(username, score, totalQuestions);
  } catch (error) {
    console.error('Error saving score:', error);
    // Don't throw - this is not critical functionality
  }
}