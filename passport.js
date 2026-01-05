// passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { getUserByUsername } = require('./db/queries');

passport.use(new LocalStrategy(
  { usernameField: 'username' },
  async (username, password, done) => {
    try {
      const user = await getUserByUsername(username);
      if (!user) return done(null, false, { message: 'Incorrect username' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserByUsername(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
