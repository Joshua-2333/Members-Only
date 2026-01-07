// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const {
  createUser,
  getUserByUsername,
} = require('../db/queries');

/* SIGN UP */
router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res, next) => {
  try {
    const { firstName, lastName, username, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !username || !password || !confirmPassword) {
      return res.render('signup', { error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.render('signup', { error: 'Passwords do not match.' });
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.render('signup', { error: 'Email already registered.' });
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

/* LOGIN */
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

/* LOGOUT */
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;
