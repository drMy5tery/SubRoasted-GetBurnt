# Guess That Comment - Reddit Devvit App

A Reddit guessing game where users test their knowledge by guessing which subreddit a comment came from. Built with Reddit's Devvit platform to run natively within Reddit.

## Features

- 🎯 **Real Reddit Comments**: Fetches live comments from popular subreddits
- 🏆 **Scoring System**: Track your accuracy across 10 questions
- 📊 **Leaderboard**: Compete with other players using Redis storage
- 📱 **Native Reddit Integration**: Runs directly within Reddit as a custom post
- 🎮 **Interactive UI**: Beautiful, responsive interface using Devvit components

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

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd guess-that-comment-devvit
   ```

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

### For Moderators
1. Go to your subreddit
2. Use the "Create Guess That Comment Game" option in the mod menu
3. This creates a new post with the game

### For Users
1. Find a "Guess That Comment" post in the subreddit
2. Click to start playing
3. Enter your username
4. Read each comment and guess which subreddit it came from
5. Complete 10 questions to see your final score
6. Check the leaderboard to see how you rank!

## Game Mechanics

- **10 Questions**: Each game consists of 10 random comments
- **Multiple Choice**: Choose from 4 subreddit options for each comment
- **Real Comments**: All comments are fetched live from Reddit
- **Scoring**: 1 point per correct answer
- **Leaderboard**: Top scores saved using Redis
- **Auto-Advance**: Questions automatically advance after selection

## Development

### Local Development
```bash
npm run dev
```
This starts the Devvit development server with hot reloading.

### Building
```bash
npm run build
```

### Uploading to Reddit
```bash
npm run upload
```

### Installing in Subreddit
```bash
devvit install <subreddit-name>
```

## App Structure

```
src/
├── main.ts          # Main Devvit app logic and components
devvit.yaml          # App configuration and permissions
package.json         # Dependencies and scripts
tsconfig.json        # TypeScript configuration
```

## Permissions Required

The app requires these Reddit API permissions:
- `read-posts` - To fetch posts from subreddits
- `read-comments` - To fetch comments for the game
- `read-subreddits` - To access subreddit information
- `create-posts` - To create game posts
- `moderate-posts` - For moderator actions

## Technical Details

- **Platform**: Reddit Devvit
- **Language**: TypeScript
- **Storage**: Redis (for leaderboard)
- **UI**: Devvit native components
- **API**: Reddit API for fetching comments

## Subreddits Included

The game pulls comments from these popular subreddits:
- AskReddit, funny, gaming, todayilearned, pics, worldnews
- aww, Music, movies, science, food, relationships
- mildlyinteresting, LifeProTips, explainlikeimfive, Showerthoughts
- cats, dogs, programming, technology, cooking, fitness

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test with `npm run dev`
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **"Command not found: devvit"**
   - Install Devvit CLI: `npm install -g devvit`

2. **"Not logged in"**
   - Run: `devvit login`

3. **"Permission denied"**
   - Make sure you're a moderator of the target subreddit

4. **"Failed to fetch comments"**
   - Check if the subreddit exists and has recent posts with comments

## License

MIT License - see LICENSE file for details

## Support

- [Devvit Documentation](https://developers.reddit.com/docs)
- [Reddit Developer Platform](https://developers.reddit.com/)
- [Devvit Examples](https://github.com/reddit/devvit)

## Changelog

### v1.0.0
- Initial release
- Basic guessing game functionality
- Leaderboard system
- Real Reddit comment integration
- Moderator tools for creating games