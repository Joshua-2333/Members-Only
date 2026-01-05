// controllers/authController.js
const bcrypt = require('bcrypt');
const passport = require('passport');
const {
  createUser,
  getUserByUsername,
  upgradeUserToMember,
} = require('../db/queries');

/* GET signup form */
exports.signupGet = (req, res) => {
  res.render('signup', { currentUser: req.user, error: null });
};

/* POST signup */
exports.signupPost = async (req, res, next) => {
  try {
    const { firstName, lastName, username, password, confirmPassword } = req.body;

    // Required fields
    if (!firstName || !lastName || !username || !password || !confirmPassword) {
      return res.render('signup', { error: 'All fields are required', currentUser: req.user });
    }

    // Passwords match
    if (password !== confirmPassword) {
      return res.render('signup', { error: 'Passwords do not match', currentUser: req.user });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      return res.render('signup', { error: 'Invalid email address', currentUser: req.user });
    }

    // Check if user exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.render('signup', { error: 'Email already registered', currentUser: req.user });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser({
      first_name: firstName,
      last_name: lastName,
      username,
      password: hashedPassword,
    });

    // Auto-login
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/auth/signup',
    })(req, res, next);

  } catch (err) {
    next(err);
  }
};

/* GET login form */
exports.loginGet = (req, res) => {
  res.render('login', { currentUser: req.user, error: null });
};

/* POST login with error handling */
exports.loginPost = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render('login', { currentUser: req.user, error: info.message || 'Invalid credentials' });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
};

/* GET logout */
exports.logoutGet = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};

/* GET join members form */
exports.joinGet = (req, res) => {
  if (!req.user) return res.redirect('/auth/login');
  res.render('join', { currentUser: req.user, error: null });
};

/* POST join members */
exports.joinPost = async (req, res, next) => {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const { passcode } = req.body;

    if (passcode !== process.env.MEMBER_SECRET) {
      return res.render('join', { error: 'Incorrect secret', currentUser: req.user });
    }

    await upgradeUserToMember(req.user.id);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};
