// routes/index.js
const express = require('express');
const router = express.Router();
const {
  getAllMessages,
  upgradeUserToMember,
} = require('../db/queries');

/* Generate a random riddle */
function generateRiddle() {
  const riddles = [
    { question: 'What is 6 × 7?', answer: 42 },
    { question: 'What is (10 + 2) × 3?', answer: 36 },
    { question: 'What is 81 ÷ 9?', answer: 9 },
    { question: 'What is 14 + 5?', answer: 19 },
    { question: 'What is 8 × (4 + 1)?', answer: 40 },
  ];

  return riddles[Math.floor(Math.random() * riddles.length)];
}

/* HOME PAGE */
router.get('/', async (req, res, next) => {
  try {
    const messages = await getAllMessages();

    res.render('index', {
      currentUser: req.user || null,
      messages,
    });
  } catch (err) {
    next(err);
  }
});

/* JOIN CLUB – GET */
router.get('/join', (req, res) => {
  if (!req.user) return res.redirect('/auth/login');
  if (req.user.is_member) return res.redirect('/');

  const riddle = generateRiddle();

  req.session.joinRiddle = {
    question: riddle.question,
    answer: riddle.answer,
  };

  res.render('join', {
    currentUser: req.user,
    question: riddle.question,
    error: null,
    successMessage: null,
  });
});

/* JOIN CLUB – POST */
router.post('/join', async (req, res, next) => {
  try {
    if (!req.user) return res.redirect('/auth/login');
    if (req.user.is_member) return res.redirect('/');

    const userAnswer = Number(req.body.answer);
    const storedRiddle = req.session.joinRiddle;

    if (!storedRiddle || userAnswer !== storedRiddle.answer) {
      const newRiddle = generateRiddle();

      req.session.joinRiddle = {
        question: newRiddle.question,
        answer: newRiddle.answer,
      };

      return res.render('join', {
        currentUser: req.user,
        question: newRiddle.question,
        error: '❌ Incorrect answer. Try again.',
        successMessage: null,
      });
    }

    await upgradeUserToMember(req.user.id);
    delete req.session.joinRiddle;

    res.render('join', {
      currentUser: req.user,
      question: null,
      error: null,
      successMessage: '🎉 Membership Unlocked!',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
