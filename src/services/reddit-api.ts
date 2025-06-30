// Reddit API integration with proper authentication and fallback system
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

// Mock comments for fallback when Reddit API is unavailable
const MOCK_COMMENTS: Comment[] = [
  {
    id: 'mock_1',
    text: "I can't believe I spent 3 hours debugging only to realize I forgot a semicolon. This is why I have trust issues with my own code.",
    subreddit: 'programming',
    score: 1247,
    author: 'CodeWarrior2024'
  },
  {
    id: 'mock_2',
    text: "My cat knocked over my coffee onto my keyboard this morning. Now my spacebar types 'meow' instead of spaces. I'm not even mad, that's impressive.",
    subreddit: 'cats',
    score: 892,
    author: 'CatLover42'
  },
  {
    id: 'mock_3',
    text: "TIL that honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3000 years old and still perfectly edible.",
    subreddit: 'todayilearned',
    score: 2156,
    author: 'FactHunter'
  },
  {
    id: 'mock_4',
    text: "Am I the only one who thinks pineapple on pizza is actually amazing? The sweet and savory combination is perfect. Fight me.",
    subreddit: 'unpopularopinion',
    score: 567,
    author: 'PineapplePizzaFan'
  },
  {
    id: 'mock_5',
    text: "Shower thought: If you're waiting for the waiter, aren't you the waiter?",
    subreddit: 'Showerthoughts',
    score: 3421,
    author: 'DeepThinker99'
  },
  {
    id: 'mock_6',
    text: "TIFU by accidentally sending a love letter meant for my crush to my mom instead. She replied with 'I love you too sweetie, but please clean your room.'",
    subreddit: 'tifu',
    score: 1834,
    author: 'EmbarrassedTeen'
  },
  {
    id: 'mock_7',
    text: "LPT: If you're feeling overwhelmed, try the 5-4-3-2-1 technique. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    subreddit: 'LifeProTips',
    score: 2789,
    author: 'MindfulHelper'
  },
  {
    id: 'mock_8',
    text: "My dog learned to open doors by watching me. Now I can't keep him out of any room. He's too smart for his own good.",
    subreddit: 'dogs',
    score: 1456,
    author: 'DogTrainer2023'
  },
  {
    id: 'mock_9',
    text: "The new Spider-Man movie was incredible! The way they handled the multiverse concept was mind-blowing. Best superhero movie in years.",
    subreddit: 'movies',
    score: 987,
    author: 'MovieBuff2024'
  },
  {
    id: 'mock_10',
    text: "Just finished building my first PC! It took 6 hours and I was terrified the whole time, but it booted up on the first try. I feel like a tech wizard.",
    subreddit: 'gaming',
    score: 2341,
    author: 'PCBuilder2024'
  },
  {
    id: 'mock_11',
    text: "ELI5: Why do we get brain freeze when we eat ice cream too fast?",
    subreddit: 'explainlikeimfive',
    score: 1678,
    author: 'CuriousKid'
  },
  {
    id: 'mock_12',
    text: "My girlfriend and I have been together for 3 years and she still laughs at my dad jokes. I think she might be the one.",
    subreddit: 'relationships',
    score: 2456,
    author: 'DadJokeMaster'
  },
  {
    id: 'mock_13',
    text: "I made homemade pasta from scratch for the first time today. It was messy, took forever, but tasted absolutely incredible. Worth every minute.",
    subreddit: 'food',
    score: 1234,
    author: 'HomeCook2024'
  },
  {
    id: 'mock_14',
    text: "The new iPhone update completely changed how my apps look and I can't find anything. Why do they keep fixing things that aren't broken?",
    subreddit: 'technology',
    score: 3456,
    author: 'TechSkeptic'
  },
  {
    id: 'mock_15',
    text: "Scientists have discovered a new species of deep-sea fish that glows in the dark. Nature never ceases to amaze me with its creativity.",
    subreddit: 'science',
    score: 1789,
    author: 'ScienceEnthusiast'
  },
  {
    id: 'mock_16',
    text: "What's the most embarrassing thing that happened to you in high school? I'll start: I walked into the wrong classroom and sat through 20 minutes of advanced calculus before realizing my mistake.",
    subreddit: 'AskReddit',
    score: 4567,
    author: 'StoryTeller2024'
  },
  {
    id: 'mock_17',
    text: "This traffic cone has been in the same spot on my street for 3 months. I'm starting to think it's a permanent resident now.",
    subreddit: 'mildlyinteresting',
    score: 892,
    author: 'ObservantNeighbor'
  },
  {
    id: 'mock_18',
    text: "My coworker microwaves fish in the office kitchen every day. AITA for leaving passive-aggressive notes about it?",
    subreddit: 'AmItheAsshole',
    score: 2134,
    author: 'OfficeWorker2024'
  },
  {
    id: 'mock_19',
    text: "I just discovered that my 'lucky' shirt that I've worn to every job interview for 5 years has had a small stain on it the whole time. Still got all the jobs though.",
    subreddit: 'funny',
    score: 3789,
    author: 'LuckyStain'
  },
  {
    id: 'mock_20',
    text: "What did I just witness? A squirrel stole a slice of pizza from a guy's hand and ran up a tree with it. The audacity of urban wildlife never fails to surprise me.",
    subreddit: 'WTF',
    score: 2567,
    author: 'UrbanWildlifeWatcher'
  }
];

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

  private getRandomMockComment(): Comment {
    const randomIndex = Math.floor(Math.random() * MOCK_COMMENTS.length);
    return { ...MOCK_COMMENTS[randomIndex] };
  }

  async fetchRandomComment(): Promise<Comment> {
    // First try to use real Reddit API
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

            console.log('Successfully fetched real Reddit comment from r/' + randomSubreddit);
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
      console.warn('Reddit API failed, using mock comment:', error);
      
      // Fallback to mock comments
      const mockComment = this.getRandomMockComment();
      console.log('Using mock comment from r/' + mockComment.subreddit);
      return mockComment;
    }
  }
}

export const redditClient = new RedditAPIClient();