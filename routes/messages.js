// routes/messages.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/login');
}

/* New message */
router.get('/new', ensureAuthenticated, messageController.messageCreateGet);
router.post('/new', ensureAuthenticated, messageController.messageCreatePost);

/* Delete message (admin only) */
router.post('/:id/delete', ensureAuthenticated, messageController.messageDeletePost);

module.exports = router;
