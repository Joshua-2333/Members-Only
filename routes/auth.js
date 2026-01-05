// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const { createUser, getUserByUsername, makeUserMember } = require('../db/queries');

router.get('/signup', (req, res) => res.render('signup'));
router.post('/signup', async (req, res) => {
  const { firstName, lastName, username, password, confirmPassword } = req.body;
  if (password !== confirmPassword) return res.send('Passwords do not match');

  const hashedPassword = await bcrypt.hash(password, 10);
  await createUser({ firstName, lastName, username, hashedPassword });
  res.redirect('/auth/login');
});

router.get('/login', (req, res) => res.render('login'));
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
}));

router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

// Membership join
router.post('/join', async (req, res) => {
  const { passcode } = req.body;
  if (passcode === process.env.CLUB_PASSCODE) {
    await makeUserMember(req.user.id);
    return res.redirect('/');
  }
  res.send('Wrong passcode!');
});

module.exports = router;
