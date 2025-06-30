import { Question, Comment } from '../types';

const mockComments: Comment[] = [
  {
    id: '1',
    text: 'This is why I have trust issues with my teammates',
    subreddit: 'gaming',
    author: 'GamerDude123'
  },
  {
    id: '2',
    text: 'My cat knocked over my coffee again this morning',
    subreddit: 'cats',
    author: 'CatLover42'
  },
  {
    id: '3',
    text: 'Just finished my first marathon! My legs feel like jelly',
    subreddit: 'running',
    author: 'RunnerGirl'
  },
  {
    id: '4',
    text: 'This recipe changed my life. Never going back to store-bought',
    subreddit: 'cooking',
    author: 'ChefMaster'
  },
  {
    id: '5',
    text: 'The plot twist in the latest episode had me shook',
    subreddit: 'television',
    author: 'TVAddict'
  },
  {
    id: '6',
    text: 'My portfolio is down 20% this month. Time to buy the dip?',
    subreddit: 'investing',
    author: 'StockTrader'
  },
  {
    id: '7',
    text: 'Finally got my dream job after 6 months of interviews',
    subreddit: 'jobs',
    author: 'CareerClimber'
  },
  {
    id: '8',
    text: 'This bug has been haunting me for 3 days straight',
    subreddit: 'programming',
    author: 'CodeWarrior'
  },
  {
    id: '9',
    text: 'The sunset from my balcony tonight was absolutely breathtaking',
    subreddit: 'photography',
    author: 'PhotoEnthusiast'
  },
  {
    id: '10',
    text: 'My sourdough starter finally doubled in size!',
    subreddit: 'Breadit',
    author: 'BreadMaker'
  },
  {
    id: '11',
    text: 'This workout routine has me sore in places I forgot existed',
    subreddit: 'fitness',
    author: 'GymRat'
  },
  {
    id: '12',
    text: 'The new update completely broke my favorite mod',
    subreddit: 'gaming',
    author: 'ModEnthusiast'
  },
  {
    id: '13',
    text: 'My houseplant collection is getting out of control',
    subreddit: 'houseplants',
    author: 'PlantParent'
  },
  {
    id: '14',
    text: 'This book kept me up until 3 AM. Worth every minute',
    subreddit: 'books',
    author: 'BookWorm'
  },
  {
    id: '15',
    text: 'The traffic on my commute today was absolutely insane',
    subreddit: 'mildlyinfuriating',
    author: 'Commuter'
  }
];

const subreddits = [
  'gaming', 'cats', 'running', 'cooking', 'television', 'investing', 
  'jobs', 'programming', 'photography', 'Breadit', 'fitness', 
  'houseplants', 'books', 'mildlyinfuriating', 'funny', 'aww',
  'todayilearned', 'explainlikeimfive', 'askreddit', 'science'
];

export const generateMockQuestions = (count: number): Question[] => {
  const questions: Question[] = [];
  const usedComments = new Set<string>();

  for (let i = 0; i < count && questions.length < mockComments.length; i++) {
    let comment: Comment;
    do {
      comment = mockComments[Math.floor(Math.random() * mockComments.length)];
    } while (usedComments.has(comment.id));

    usedComments.add(comment.id);

    // Generate 3 wrong options
    const wrongOptions = subreddits
      .filter(sub => sub !== comment.subreddit)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Combine with correct answer and shuffle
    const options = [...wrongOptions, comment.subreddit]
      .sort(() => Math.random() - 0.5);

    questions.push({
      comment,
      options,
      correctAnswer: comment.subreddit
    });
  }

  return questions;
};