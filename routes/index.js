// routes/index.js
const express = require('express');
const router = express.Router();
const { getAllMessages } = require('../db/queries');

router.get('/', async (req, res) => {
  const messages = await getAllMessages();

  res.render('index', {
    user: req.user,
    messages,
  });
});

router.get('/join', (req, res) => {
  res.render('join', { user: req.user });
});

module.exports = router;
