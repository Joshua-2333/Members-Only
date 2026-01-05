// routes/messages.js
const express = require('express');
const router = express.Router();
const {
  createMessage,
  deleteMessageById,
} = require('../db/queries');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/login');
}

router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('new-message');
});

router.post('/new', ensureAuthenticated, async (req, res) => {
  const { title, body } = req.body;
  await createMessage({
    title,
    body,
    user_id: req.user.id,
  });
  res.redirect('/');
});

router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  if (!req.user.is_admin) return res.send('Not allowed');

  await deleteMessageById(req.params.id);
  res.redirect('/');
});

module.exports = router;
