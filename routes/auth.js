// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const {
  createUser,
  getUserByUsername,
  upgradeUserToMember,
} = require('../db/queries');

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res, next) => {
  try {
    const { firstName, lastName, username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.send('Passwords do not match');
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser({
      first_name: firstName,
      last_name: lastName,
      username,
      password: hashedPassword,
    });

    res.redirect('/auth/login');
  } catch (err) {
    next(err);
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
  })
);

router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

router.post('/join', async (req, res) => {
  if (!req.user) return res.redirect('/auth/login');

  if (req.body.passcode === process.env.MEMBER_SECRET) {
    await upgradeUserToMember(req.user.id);
    return res.redirect('/');
  }

  res.send('Wrong passcode');
});

module.exports = router;
