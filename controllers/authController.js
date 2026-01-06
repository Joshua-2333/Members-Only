// controllers/authController.js
const bcrypt = require('bcrypt');
const passport = require('passport');
const {
  createUser,
  getUserByUsername,
  upgradeUserToMember,
} = require('../db/queries');

/* GET signup */
exports.signupGet = (req, res) => {
  res.render('signup', { currentUser: req.user, error: null });
};

/* POST signup */
exports.signupPost = async (req, res, next) => {
  try {
    const { firstName, lastName, username, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !username || !password || !confirmPassword) {
      return res.render('signup', {
        currentUser: req.user,
        error: 'All fields are required.',
      });
    }

    if (password !== confirmPassword) {
      return res.render('signup', {
        currentUser: req.user,
        error: 'Passwords do not match.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      return res.render('signup', {
        currentUser: req.user,
        error: 'Please enter a valid email address.',
      });
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.render('signup', {
        currentUser: req.user,
        error: 'Email is already registered.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser({
      first_name: firstName,
      last_name: lastName,
      username,
      password: hashedPassword,
    });

    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/auth/signup',
    })(req, res, next);
  } catch (err) {
    next(err);
  }
};

/* GET login */
exports.loginGet = (req, res) => {
  res.render('login', { currentUser: req.user, error: null });
};

/* POST login */
exports.loginPost = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render('login', {
        currentUser: req.user,
        error: info?.message || 'Invalid email or password.',
      });
    }
    req.logIn(user, err => {
      if (err) return next(err);
      res.redirect('/');
    });
  })(req, res, next);
};

/* Logout */
exports.logoutGet = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};

/* JOIN MEMBERS (RIDDLE LOGIC) */

/* GET join page */
exports.joinGet = (req, res) => {
  if (!req.user) return res.redirect('/auth/login');

  // Generate a random riddle
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const question = `What is ${a} + ${b}?`;
  req.session.riddleAnswer = (a + b).toString();

  res.render('join', {
    currentUser: req.user,
    question,
    error: null,
    successMessage: null,
  });
};

/* POST join page */
exports.joinPost = async (req, res, next) => {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const userAnswer = req.body.answer?.trim();

    // Wrong answer: regenerate riddle and show error
    if (!userAnswer || userAnswer !== req.session.riddleAnswer) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const question = `What is ${a} + ${b}?`;
      req.session.riddleAnswer = (a + b).toString();

      return res.render('join', {
        currentUser: req.user,
        question,
        error: '❌ Incorrect answer. Try again!',
        successMessage: null,
      });
    }

    // Correct answer: upgrade user to member
    await upgradeUserToMember(req.user.id);
    req.user.is_member = true;

    res.render('join', {
      currentUser: req.user,
      question: null,
      error: null,
      successMessage: '🎉 Membership Unlocked!',
    });
  } catch (err) {
    next(err);
  }
};
