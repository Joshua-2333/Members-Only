// passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const {
  getUserByUsername,
  getUserById,
} = require('./db/queries');

/*Local Strategy (Login)*/
passport.use(
  new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
      try {
        const user = await getUserByUsername(username);

        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.password
        );

        if (!passwordMatches) {
          return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/*Serialize user ID into session*/
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/*Deserialize user from session*/
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);

    if (!user) {
      return done(null, false);
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
