# GuessThatComment - The Ultimate Reddit Guessing Game

Test your Reddit knowledge by guessing which subreddit a comment came from. Get roasted by AI when you're wrong!

## Features

- 🎯 **Real Reddit Comments**: Fetches live comments from popular subreddits
- 🤖 **AI-Powered Roasts**: Get hilariously roasted by Groq AI when you guess wrong
- 🎵 **Text-to-Speech**: Hear your roasts with ElevenLabs voice synthesis
- 🏆 **Leaderboard**: Compete with other players
- 📊 **Cringe Rating**: Rate comments on their cringe level
- 📱 **Responsive Design**: Beautiful UI that works on all devices

## Setup

### 1. Reddit API Setup
1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose "script" as the app type
4. Copy your Client ID and Secret

### 2. Groq API Setup (Optional - for AI roasts)
1. Go to [Groq Console](https://console.groq.com/)
2. Create an account and get your API key
3. Add it to your `.env` file

### 3. ElevenLabs API Setup (Optional - for text-to-speech)
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Create an account and get your API key
3. Add it to your `.env` file

### 4. Environment Variables
Create a `.env` file in the root directory:

```env
# Reddit API Configuration (Required)
VITE_REDDIT_CLIENT_ID=your_reddit_client_id_here
VITE_REDDIT_CLIENT_SECRET=your_reddit_client_secret_here

# Groq API for AI Roasts (Optional)
VITE_GROQ_API_KEY=your_groq_api_key_here

# ElevenLabs API for Text-to-Speech (Optional)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Supabase Configuration (Optional - for leaderboard)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5. Install and Run
```bash
npm install
npm run dev
```

## How It Works

1. **Reddit Integration**: Uses Reddit's OAuth API to fetch real comments from popular subreddits
2. **AI Roasts**: When you guess wrong, Groq's Llama model generates a witty, sarcastic roast
3. **Voice Synthesis**: ElevenLabs converts the roast text to speech with a sarcastic voice
4. **Scoring**: Track your accuracy and compete on the leaderboard
5. **Cringe Rating**: Rate comments to build a community-driven cringe database

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **APIs**: Reddit API, Groq AI, ElevenLabs
- **Database**: Supabase (optional)
- **Build Tool**: Vite
- **Icons**: Lucide React

## API Features

### Reddit API
- Fetches real comments from 20+ popular subreddits
- Filters for quality comments (length, score, content)
- Handles authentication with client credentials flow

### Groq AI
- Uses Llama 3 70B model for generating roasts
- Customized prompts for Reddit-style humor
- Fallback roasts if API is unavailable

### ElevenLabs
- Uses Rachel voice for sarcastic delivery
- Optimized voice settings for humor
- Graceful fallback if API is unavailable

## Contributing

Feel free to contribute by:
- Adding more subreddits to the game
- Improving the roast prompts
- Enhancing the UI/UX
- Adding new features

Built with ⚡ [Bolt.new](https://bolt.new)