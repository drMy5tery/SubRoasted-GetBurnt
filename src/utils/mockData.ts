interface Question {
  id: string
  comment: string
  correctAnswer: string
  options: string[]
}

const mockComments = [
  {
    comment: "Just adopted this little guy from the shelter. He's been following me around all day!",
    correctAnswer: "aww",
    options: ["aww", "cats", "dogs", "pics"]
  },
  {
    comment: "TIL that honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3000 years old and still perfectly edible.",
    correctAnswer: "todayilearned",
    options: ["todayilearned", "science", "history", "interestingasfuck"]
  },
  {
    comment: "Does anyone else think that cereal is just cold soup?",
    correctAnswer: "Showerthoughts",
    options: ["Showerthoughts", "unpopularopinion", "AskReddit", "food"]
  },
  {
    comment: "My code finally compiled on the first try. I'm suspicious that I did something wrong.",
    correctAnswer: "programming",
    options: ["programming", "ProgrammerHumor", "webdev", "technology"]
  },
  {
    comment: "What's a movie that everyone loves but you just can't get into?",
    correctAnswer: "AskReddit",
    options: ["AskReddit", "movies", "unpopularopinion", "television"]
  },
  {
    comment: "This pasta sauce recipe has been in my family for generations. The secret ingredient is love... and a lot of garlic.",
    correctAnswer: "food",
    options: ["food", "cooking", "recipes", "MealPrepSunday"]
  },
  {
    comment: "My gym buddy hasn't shown up in 3 weeks. I'm starting to think he was just imaginary.",
    correctAnswer: "fitness",
    options: ["fitness", "gym", "loseit", "bodybuilding"]
  },
  {
    comment: "The way this ice formed on my car window looks exactly like a tree branch.",
    correctAnswer: "mildlyinteresting",
    options: ["mildlyinteresting", "oddlysatisfying", "pics", "interestingasfuck"]
  },
  {
    comment: "Scientists have discovered a new species of deep-sea fish that can survive at depths of over 8000 meters.",
    correctAnswer: "science",
    options: ["science", "todayilearned", "nature", "marinebiology"]
  },
  {
    comment: "LPT: If you're feeling overwhelmed, write down everything you need to do. Sometimes seeing it on paper makes it feel more manageable.",
    correctAnswer: "LifeProTips",
    options: ["LifeProTips", "productivity", "getmotivated", "selfimprovement"]
  },
  {
    comment: "My girlfriend says I never listen to her. At least I think that's what she said.",
    correctAnswer: "funny",
    options: ["funny", "dadjokes", "relationships", "jokes"]
  },
  {
    comment: "ELI5: Why do we get brain freeze when we eat ice cream too fast?",
    correctAnswer: "explainlikeimfive",
    options: ["explainlikeimfive", "askscience", "NoStupidQuestions", "science"]
  },
  {
    comment: "Breaking: Major earthquake hits the Pacific Ring of Fire, tsunami warnings issued for several countries.",
    correctAnswer: "worldnews",
    options: ["worldnews", "news", "geology", "NaturalDisasters"]
  },
  {
    comment: "This boss fight took me 47 attempts. I'm not even mad, I'm impressed with my own persistence.",
    correctAnswer: "gaming",
    options: ["gaming", "darksouls", "patientgamers", "tipofmyjoystick"]
  },
  {
    comment: "The new album from this indie band is absolutely incredible. Every track is a masterpiece.",
    correctAnswer: "Music",
    options: ["Music", "indieheads", "listentothis", "WeAreTheMusicMakers"]
  }
]

export const generateMockQuestions = (): Question[] => {
  // Shuffle the comments and take 10
  const shuffled = [...mockComments].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 10).map((comment, index) => ({
    id: `question-${index}`,
    ...comment
  }))
}