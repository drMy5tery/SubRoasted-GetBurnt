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
    console.log('Successfully fetched real Reddit comment from r/' + comment.subreddit);
    return comment;
  } catch (error) {
    console.error('Reddit API failed:', error);
    throw new Error('Unable to fetch Reddit comments. Please check your Reddit API configuration.');
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

export async function generateRoast(comment: string, wrongGuess: string, correctAnswer: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('Groq API key not configured');
    }
    
    const prompt = `Roast someone who guessed "${wrongGuess}" when the correct subreddit was "${correctAnswer}". Make it funny, sarcastic, and Reddit-style. Keep it under 100 words and make it playful and witty with a lot of passive aggressiveness.`;
    
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
            content: 'You are a witty, sarcastic AI that roasts people for wrong Reddit guesses. Be funny but not mean. Use Reddit slang and internet humor.'
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
    
    // Fallback roasts if API fails
    const fallbackRoasts = [
      `Really? You thought that comment belonged in r/${wrongGuess}? That's about as accurate as a weather forecast from a magic 8-ball.`,
      `Oh honey, guessing r/${wrongGuess} for that comment is like bringing a spoon to a knife fight - completely missing the point.`,
      `I've seen GPS systems with better navigation skills than your guess of r/${wrongGuess}. The correct answer was right there!`,
      `That guess was so off, even autocorrect wouldn't have made that mistake. r/${correctAnswer} was the obvious choice!`,
      `Congratulations! You've just proven that even a broken clock is right twice a day, but you're not even close to that accuracy.`
    ];
    
    return fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
  }
}

export async function generateSpeech(text: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }
    
    // Using Rachel voice (voice_id for a sarcastic female voice)
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice ID
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }
    
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
    
  } catch (error) {
    console.error('Error generating speech:', error);
    
    // Return empty string if speech generation fails
    // The UI will handle this gracefully by not showing the audio player
    return '';
  }
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