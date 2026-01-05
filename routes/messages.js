// routes/messages.js
const express = require('express');
const router = express.Router();
const { createMessage, deleteMessage } = require('../db/queries');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/login');
}

router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('new-message');
});

router.post('/new', ensureAuthenticated, async (req, res) => {
  const { title, body } = req.body;
  await createMessage({ title, body, userId: req.user.id });
  res.redirect('/');
});

router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  if (!req.user.is_admin) return res.send('Not allowed');
  await deleteMessage(req.params.id);
  res.redirect('/');
});

module.exports = router;
