// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const messagesRouter = require('./routes/messages');

const { insertDefaultMessages } = require('./db/queries'); // Import the function to ensure default messages

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== Views ===== */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* ===== Middleware ===== */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/* ===== Static files ===== */
app.use(express.static(path.join(__dirname, 'public')));

/* ===== Session ===== */
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);

/* ===== Passport ===== */
require('./passport');
app.use(passport.initialize());
app.use(passport.session());

/* Make current user available in all views */
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

/* ===== Routes ===== */
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/messages', messagesRouter);

/* ===== 404 Handler ===== */
app.use((req, res) => {
  res.status(404).render('404');
});

/* ===== 500 Handler ===== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');
});

/* ===== Start Server after ensuring default messages ===== */
(async () => {
  try {
    await insertDefaultMessages(); // Inserts 3 default messages if they don't exist
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to insert default messages:', err);
    process.exit(1); // Exit if initialization fails
  }
})();
