const express = require('express');
const router = express.Router();
const { comfortData, fallback } = require('../data/comfortData');

const CRISIS_SIGNALS = [
  'end my life',
  'want to die',
  'kill myself',
  "can't go on anymore",
  'no reason to live',
  'better off dead',
  'end it all',
  'take my life'
];

const SCORE_THRESHOLD = 2;

function detectCategories(inputText) {
  const cleaned = inputText.toLowerCase().replace(/[^\w\s']/g, ' ').replace(/\s+/g, ' ').trim();

  for (const signal of CRISIS_SIGNALS) {
    if (cleaned.includes(signal)) {
      return { crisis: true };
    }
  }

  const scores = comfortData.map((category) => {
    let score = 0;

    for (const keyword of category.keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/'/g, "'")}\\b`, 'i');
      if (regex.test(cleaned)) {
        score += 2;
      }
    }

    for (const phrase of category.phrases) {
      if (cleaned.includes(phrase.toLowerCase())) {
        score += 3;
      }
    }

    return { id: category.id, score };
  });

  scores.sort((a, b) => b.score - a.score);

  const top = scores.filter((s) => s.score >= SCORE_THRESHOLD).slice(0, 2);

  return { crisis: false, topIds: top.map((t) => t.id) };
}

function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildCategoryResponse(category) {
  return {
    id: category.id,
    title: category.title,
    stories: category.stories,
    verses: category.verses,
    encouragement: pickOne(category.encouragement),
    prayerPoints: category.prayerPoints,
    declaration: category.declaration
  };
}

router.post('/comfort', (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a message.' });
    }

    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message is too long.' });
    }

    const result = detectCategories(message);

    if (result.crisis) {
      return res.json({
        crisis: true,
        message:
          'Your life has great value. Please talk to someone you trust — a pastor, family member, or friend. You do not have to carry this alone.',
        verses: [
          {
            reference: 'Psalm 34:18',
            text: 'The LORD is near to the brokenhearted and saves the crushed in spirit.'
          },
          {
            reference: 'Jeremiah 29:11',
            text: 'For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.'
          },
          {
            reference: 'Isaiah 41:10',
            text: 'Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.'
          }
        ]
      });
    }

    if (result.topIds.length === 0) {
      return res.json({
        crisis: false,
        detected: ['general'],
        categories: [
          {
            id: fallback.id,
            title: fallback.title,
            stories: fallback.stories,
            verses: fallback.verses,
            encouragement: fallback.encouragement,
            prayerPoints: fallback.prayerPoints,
            declaration: fallback.declaration
          }
        ]
      });
    }

    const matchedCategories = result.topIds
      .map((id) => comfortData.find((c) => c.id === id))
      .filter(Boolean)
      .map(buildCategoryResponse);

    return res.json({
      crisis: false,
      detected: result.topIds,
      categories: matchedCategories
    });
  } catch (err) {
    console.error('Error in /comfort route:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
