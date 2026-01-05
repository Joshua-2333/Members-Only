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

    // 1️⃣ Required fields
    if (!firstName || !lastName || !username || !password || !confirmPassword) {
      return res.render('signup', {
        currentUser: req.user,
        error: 'All fields are required.',
      });
    }

    // 2️⃣ Passwords match
    if (password !== confirmPassword) {
      return res.render('signup', {
        currentUser: req.user,
        error: 'Passwords do not match.',
      });
    }

    // 3️⃣ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      return res.render('signup', {
        currentUser: req.user,
        error: 'Please enter a valid email address.',
      });
    }

    // 4️⃣ Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.render('signup', {
        currentUser: req.user,
        error: 'Email is already registered.',
      });
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser({
      first_name: firstName,
      last_name: lastName,
      username,
      password: hashedPassword,
    });

    // 6️⃣ Auto-login after signup
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

/* POST login with error feedback */
exports.loginPost = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render('login', {
        currentUser: req.user,
        error: info?.message || 'Invalid email or password.',
      });
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
      return res.render('join', {
        currentUser: req.user,
        error: 'Incorrect secret.',
      });
    }

    await upgradeUserToMember(req.user.id);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};
