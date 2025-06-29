const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface RedditComment {
  id: string
  body: string
  subreddit: string
  score: number
  author: string
  created_utc: number
}

interface Comment {
  id: string
  text: string
  subreddit: string
  score: number
  author: string
}

// Popular subreddits that typically have good content for the game
const TARGET_SUBREDDITS = [
  'AskReddit', 'explainlikeimfive', 'todayilearned', 'LifeProTips', 
  'unpopularopinion', 'Showerthoughts', 'mildlyinteresting', 'tifu',
  'AmItheAsshole', 'relationships', 'programming', 'technology',
  'science', 'movies', 'gaming', 'food', 'cats', 'dogs'
]

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Retry mechanism with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json, text/html, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...options.headers,
        }
      })

      // If successful or non-retryable error, return the response
      if (response.ok || (response.status !== 403 && response.status !== 429 && response.status !== 502 && response.status !== 503 && response.status !== 504)) {
        return response
      }

      // If it's a retryable error and we have attempts left, continue to retry
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000 // Exponential backoff with jitter
        console.log(`Attempt ${attempt + 1} failed with status ${response.status}, retrying in ${delayMs}ms...`)
        await delay(delayMs)
        continue
      }

      // If we've exhausted retries, throw an error
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    } catch (error) {
      lastError = error as Error
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError
      }

      // Otherwise, wait and retry
      const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000
      console.log(`Attempt ${attempt + 1} failed with error: ${lastError.message}, retrying in ${delayMs}ms...`)
      await delay(delayMs)
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get a random subreddit to fetch from
    const randomSubreddit = TARGET_SUBREDDITS[Math.floor(Math.random() * TARGET_SUBREDDITS.length)]
    
    // Fetch recent posts from the subreddit using Reddit's JSON API
    const redditUrl = `https://www.reddit.com/r/${randomSubreddit}/hot.json?limit=25`
    
    const response = await fetchWithRetry(redditUrl)

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`)
    }

    const data = await response.json()
    const posts = data.data.children

    if (!posts || posts.length === 0) {
      throw new Error('No posts found')
    }

    // Find a post with comments
    let selectedComment: Comment | null = null
    
    for (const post of posts) {
      const postData = post.data
      
      // Skip if post has no comments or is removed/deleted
      if (postData.num_comments === 0 || postData.removed_by_category || postData.selftext === '[removed]') {
        continue
      }

      // Fetch comments for this post
      const commentsUrl = `https://www.reddit.com/r/${randomSubreddit}/comments/${postData.id}.json?limit=50`
      
      try {
        const commentsResponse = await fetchWithRetry(commentsUrl)

        if (!commentsResponse.ok) continue

        const commentsData = await commentsResponse.json()
        const comments = commentsData[1]?.data?.children || []

        // Filter for good comments
        const goodComments = comments.filter((comment: any) => {
          const commentData = comment.data
          return (
            commentData.body &&
            commentData.body !== '[deleted]' &&
            commentData.body !== '[removed]' &&
            commentData.body.length > 50 &&
            commentData.body.length < 500 &&
            commentData.score > 5 &&
            commentData.author !== '[deleted]' &&
            !commentData.stickied &&
            !commentData.body.includes('http') // Avoid comments with links
          )
        })

        if (goodComments.length > 0) {
          const randomComment = goodComments[Math.floor(Math.random() * goodComments.length)]
          const commentData = randomComment.data

          selectedComment = {
            id: commentData.id,
            text: commentData.body.trim(),
            subreddit: randomSubreddit,
            score: commentData.score,
            author: commentData.author
          }
          break
        }
      } catch (error) {
        console.error('Error fetching comments for post:', error)
        continue
      }
    }

    if (!selectedComment) {
      throw new Error('No suitable comments found')
    }

    return new Response(
      JSON.stringify(selectedComment),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in fetch-reddit-comment function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch Reddit comment',
        message: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})