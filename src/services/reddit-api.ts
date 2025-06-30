// Reddit API integration with proper authentication
interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    subreddit: string;
    score: number;
    author: string;
    num_comments: number;
    created_utc: number;
  };
}

interface RedditComment {
  data: {
    id: string;
    body: string;
    subreddit: string;
    score: number;
    author: string;
    created_utc: number;
  };
}

interface Comment {
  id: string;
  text: string;
  subreddit: string;
  score: number;
  author: string;
}

class RedditAPIClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  private readonly CLIENT_ID = import.meta.env.VITE_REDDIT_CLIENT_ID;
  private readonly CLIENT_SECRET = import.meta.env.VITE_REDDIT_CLIENT_SECRET;
  private readonly USER_AGENT = 'GuessThatComment/1.0.0';

  // Popular subreddits for the game
  private readonly TARGET_SUBREDDITS = [
    'AskReddit', 'explainlikeimfive', 'todayilearned', 'LifeProTips', 
    'unpopularopinion', 'Showerthoughts', 'mildlyinteresting', 'tifu',
    'AmItheAsshole', 'relationships', 'programming', 'technology',
    'science', 'movies', 'gaming', 'food', 'cats', 'dogs', 'funny',
    'WTF', 'trees', 'aww', 'Music', 'pics', 'worldnews', 'politics'
  ];

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
      throw new Error('Reddit API credentials not configured. Please set VITE_REDDIT_CLIENT_ID and VITE_REDDIT_CLIENT_SECRET in your .env file');
    }

    // Get new access token using client credentials flow
    const auth = btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`);
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.USER_AGENT,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Failed to get Reddit access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute for safety

    return this.accessToken;
  }

  private async makeAuthenticatedRequest(url: string): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': this.USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async fetchRandomComment(): Promise<Comment> {
    try {
      // Get a random subreddit
      const randomSubreddit = this.TARGET_SUBREDDITS[Math.floor(Math.random() * this.TARGET_SUBREDDITS.length)];
      
      // Fetch hot posts from the subreddit
      const postsData = await this.makeAuthenticatedRequest(
        `https://oauth.reddit.com/r/${randomSubreddit}/hot?limit=25`
      );

      const posts = postsData.data.children as RedditPost[];
      
      if (!posts || posts.length === 0) {
        throw new Error('No posts found');
      }

      // Find a post with comments
      for (const post of posts) {
        const postData = post.data;
        
        // Skip if post has no comments or is removed/deleted
        if (postData.num_comments === 0 || postData.selftext === '[removed]') {
          continue;
        }

        // Fetch comments for this post
        try {
          const commentsData = await this.makeAuthenticatedRequest(
            `https://oauth.reddit.com/r/${randomSubreddit}/comments/${postData.id}?limit=50`
          );

          const comments = commentsData[1]?.data?.children || [];

          // Filter for good comments
          const goodComments = comments.filter((comment: any) => {
            const commentData = comment.data;
            return (
              commentData.body &&
              commentData.body !== '[deleted]' &&
              commentData.body !== '[removed]' &&
              commentData.body.length > 50 &&
              commentData.body.length < 500 &&
              commentData.score > 0 &&
              commentData.author !== '[deleted]' &&
              !commentData.stickied &&
              !commentData.body.includes('http') && // Avoid comments with links
              !commentData.body.includes('www.') &&
              !commentData.body.includes('reddit.com')
            );
          });

          if (goodComments.length > 0) {
            const randomComment = goodComments[Math.floor(Math.random() * goodComments.length)];
            const commentData = randomComment.data;

            return {
              id: commentData.id,
              text: commentData.body.trim(),
              subreddit: randomSubreddit,
              score: commentData.score,
              author: commentData.author
            };
          }
        } catch (error) {
          console.error('Error fetching comments for post:', error);
          continue;
        }
      }

      throw new Error('No suitable comments found');
    } catch (error) {
      console.error('Error fetching Reddit comment:', error);
      throw error;
    }
  }
}

export const redditClient = new RedditAPIClient();