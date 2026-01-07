// controllers/authController.js
const bcrypt = require('bcrypt');
const passport = require('passport');
const {
  createUser,
  getUserByUsername,
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

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.render('signup', {
        currentUser: req.user,
        error: 'Email already registered.',
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

/* LOGOUT */
exports.logoutGet = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};
