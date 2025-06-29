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

// Fallback mock comments for when the edge function fails
const MOCK_COMMENTS: Comment[] = [
  {
    id: 'mock1',
    text: "This is exactly why I keep my sourdough starter in the fridge overnight before using it. The slow fermentation really develops those complex flavors you can't get any other way.",
    subreddit: 'Breadit',
    score: 1247,
    author: 'BreadMaster2024'
  },
  {
    id: 'mock2',
    text: "YTA. You knew your roommate had an important interview today and you still decided to practice your bagpipes at 6 AM? Come on.",
    subreddit: 'AmItheAsshole',
    score: 3891,
    author: 'JudgementalRedditor'
  },
  {
    id: 'mock3',
    text: "The mitochondria is the powerhouse of the cell. But seriously, cellular respiration is fascinating when you think about how ATP synthesis works.",
    subreddit: 'explainlikeimfive',
    score: 567,
    author: 'ScienceTeacher99'
  },
  {
    id: 'mock4',
    text: "Just spent 6 hours debugging only to realize I had a semicolon in the wrong place. Why do I do this to myself?",
    subreddit: 'programming',
    score: 2341,
    author: 'CodeWarrior42'
  },
  {
    id: 'mock5',
    text: "My cat brought me a dead mouse this morning and I praised him like he just won the Nobel Prize. I think I'm losing it.",
    subreddit: 'cats',
    score: 4567,
    author: 'CrazyCatLady'
  },
  {
    id: 'mock6',
    text: "TIL that honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3000 years old and still perfectly edible.",
    subreddit: 'todayilearned',
    score: 8923,
    author: 'FactCollector'
  },
  {
    id: 'mock7',
    text: "Anyone else think pineapple on pizza is actually amazing? Fight me.",
    subreddit: 'unpopularopinion',
    score: 156,
    author: 'PineappleLover'
  },
  {
    id: 'mock8',
    text: "TIFU by accidentally sending a love letter meant for my crush to my mom instead. She replied with 'I love you too sweetie' and now I want to disappear.",
    subreddit: 'tifu',
    score: 12456,
    author: 'EmbarrassedTeen'
  },
  {
    id: 'mock9',
    text: "The new Spider-Man movie was incredible! The way they handled the multiverse concept was chef's kiss. Tom Holland really nailed it.",
    subreddit: 'movies',
    score: 3421,
    author: 'MovieBuff2024'
  },
  {
    id: 'mock10',
    text: "Pro tip: If you're feeling overwhelmed, try the 5-4-3-2-1 grounding technique. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    subreddit: 'LifeProTips',
    score: 7890,
    author: 'MindfulHelper'
  }
];

export async function generateComment(): Promise<Comment> {
  try {
    // Try to fetch from Supabase Edge Function first
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (supabaseUrl) {
      const response = await fetch(`${supabaseUrl}/functions/v1/fetch-reddit-comment`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const comment = await response.json();
        return comment;
      } else {
        console.warn('Edge function failed, falling back to mock data');
      }
    }
  } catch (error) {
    console.error('Error fetching real comment:', error);
  }

  // Fallback to mock data
  return MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];
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
    
    const prompt = `Roast someone who guessed "${wrongGuess}" when the correct subreddit was "${correctAnswer}". Make it funny, sarcastic, and Reddit-style. Keep it under 100 words and - make it playful and witty and a lot of passive agrresiveness.`;
    
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