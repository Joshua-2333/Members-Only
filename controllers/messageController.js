// controllers/messageController.js
const {
  getAllMessages,
  createMessage,
  deleteMessageById,
} = require('../db/queries');

/* GET home page */
exports.messageList = async (req, res, next) => {
  try {
    const messages = await getAllMessages();

    res.render('index', {
      messages,
      currentUser: req.user,
    });
  } catch (err) {
    next(err);
  }
};

/* GET new message form */
exports.messageCreateGet = (req, res) => {
  if (!req.user) return res.redirect('/auth/login');

  res.render('new-message');
};

/* POST new message */
exports.messageCreatePost = async (req, res, next) => {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const { title, body } = req.body;

    await createMessage({
      title,
      body,
      user_id: req.user.id,
    });

    res.redirect('/');
  } catch (err) {
    next(err);
  }
};

/* POST delete message (ADMIN ONLY) */
exports.messageDeletePost = async (req, res, next) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).send('Not authorized');
    }

    await deleteMessageById(req.params.id);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};
