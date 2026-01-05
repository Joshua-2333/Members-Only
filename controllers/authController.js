// controllers/authController.js
const bcrypt = require('bcrypt');
const passport = require('passport');
const {
  createUser,
  getUserByUsername,
  upgradeUserToMember,
} = require('../db/queries');

/*GET signup form*/
exports.signupGet = (req, res) => {
  res.render('signup', { user: req.user });
};

/*POST signup*/
exports.signupPost = async (req, res, next) => {
  try {
    const { first_name, last_name, username, password } = req.body;

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.render('signup', {
        error: 'Username already exists',
        user: req.user,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser({
      first_name,
      last_name,
      username,
      password: hashedPassword,
    });

    // auto-login after signup
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/signup',
    })(req, res, next);
  } catch (err) {
    next(err);
  }
};

/*GET login form*/
exports.loginGet = (req, res) => {
  res.render('login', { user: req.user });
};

/*POST login*/
exports.loginPost = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
});

/*GET logout*/
exports.logoutGet = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};

/*GET join members form*/
exports.joinGet = (req, res) => {
  if (!req.user) return res.redirect('/login');
  res.render('join', { user: req.user });
};

/*POST join members*/
exports.joinPost = async (req, res, next) => {
  try {
    if (!req.user) return res.redirect('/login');

    const { secret } = req.body;

    if (secret !== process.env.MEMBER_SECRET) {
      return res.render('join', {
        error: 'Incorrect secret',
        user: req.user,
      });
    }

    await upgradeUserToMember(req.user.id);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};
