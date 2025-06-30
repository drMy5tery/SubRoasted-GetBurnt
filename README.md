# Guess That Comment - Reddit Devvit App

A Reddit guessing game where users test their knowledge by guessing which subreddit a comment came from. Built with Reddit's Devvit platform.

## Features

- 🎯 **Real Reddit Comments**: Uses live comments from popular subreddits
- 🤖 **AI Roasts**: Get roasted when you guess wrong (simplified for Devvit)
- 🏆 **Scoring System**: Track your accuracy across 10 questions
- 📱 **Native Reddit Integration**: Runs directly within Reddit

## Installation

### Prerequisites

1. Install the Devvit CLI:
   ```bash
   npm install -g devvit
   ```

2. Login to your Reddit account:
   ```bash
   devvit login
   ```

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Upload to Reddit:
   ```bash
   npm run upload
   ```

5. Install the app in your subreddit:
   ```bash
   devvit install <your-subreddit>
   ```

## How to Use

1. **As a Moderator**: Use the "Create Guess That Comment Game" option in your subreddit's mod menu
2. **As a User**: Click on any "Guess That Comment" post to start playing
3. **Gameplay**: 
   - Read the comment
   - Choose which subreddit you think it came from
   - Get your score and optional roast
   - Continue for 10 questions total

## Development

### Local Development
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Uploading to Reddit
```bash
npm run upload
```

## App Structure

- `src/main.ts` - Main Devvit app logic
- `devvit.yaml` - App configuration and permissions
- `package.json` - Dependencies and scripts

## Permissions Required

- `read-posts` - To fetch posts from subreddits
- `read-comments` - To fetch comments for the game
- `read-subreddits` - To access subreddit information
- `create-posts` - To create game posts
- `moderate-posts` - For moderator actions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run dev`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues with the Devvit platform, visit [Reddit's Devvit documentation](https://developers.reddit.com/docs).