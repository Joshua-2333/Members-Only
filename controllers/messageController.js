// controllers/messageController.js
const {
  getAllMessages,
  createMessage,
} = require('../db/queries');

/*GET home / messages*/
exports.messageList = async (req, res, next) => {
  try {
    const messages = await getAllMessages();

    res.render('index', {
      title: 'Members Only',
      messages,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

/*GET new message form*/
exports.messageCreateGet = (req, res) => {
  if (!req.user) return res.redirect('/login');
  res.render('new-message', { user: req.user });
};

/*POST new message*/
exports.messageCreatePost = async (req, res, next) => {
  try {
    if (!req.user) return res.redirect('/login');

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
