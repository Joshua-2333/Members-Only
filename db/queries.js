// db/queries.js
const pool = require('./pool');

/* USERS */

/* Create a new user */
async function createUser({ first_name, last_name, username, password }) {
  const query = `
    INSERT INTO users (first_name, last_name, username, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const values = [first_name, last_name, username, password];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

/* Get user by username (login) */
async function getUserByUsername(username) {
  const query = `
    SELECT *
    FROM users
    WHERE username = $1
  `;
  const { rows } = await pool.query(query, [username]);
  return rows[0];
}

/* Get user by id (passport deserialize) */
async function getUserById(id) {
  const query = `
    SELECT *
    FROM users
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

/* Upgrade user to member */
async function upgradeUserToMember(userId) {
  const query = `
    UPDATE users
    SET is_member = true
    WHERE id = $1
  `;
  await pool.query(query, [userId]);
}

/* MESSAGES */

/* Get all messages with author info */
async function getAllMessages() {
  const query = `
    SELECT
      messages.id,
      messages.title,
      messages.body,
      messages.created_at,
      users.first_name,
      users.last_name,
      users.username,
      users.is_member,
      users.is_admin
    FROM messages
    JOIN users ON users.id = messages.user_id
    ORDER BY messages.created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

/* Create a message */
async function createMessage({ title, body, user_id }) {
  const query = `
    INSERT INTO messages (title, body, user_id)
    VALUES ($1, $2, $3)
  `;
  const values = [title, body, user_id];
  await pool.query(query, values);
}

/* Delete a message (admin only enforced elsewhere) */
async function deleteMessageById(messageId) {
  const query = `
    DELETE FROM messages
    WHERE id = $1
  `;
  await pool.query(query, [messageId]);
}

/* --- DEFAULT MESSAGES --- */
/* Ensure 3 specific default messages exist */
async function insertDefaultMessages() {
  try {
    // Define the 3 default messages
    const defaultMessages = [
      { title: 'Welcome to The Inner Circle!', body: 'Hello everyone! This is a default message.' },
      { title: 'Rules Reminder', body: 'Remember to be respectful to all members.' },
      { title: 'Tips & Tricks', body: 'Share your tips for enjoying the club!' }
    ];

    // Ensure there is at least one user to attach messages to
    const userRes = await pool.query('SELECT id FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.log('No users found. Default messages not inserted.');
      return;
    }
    const userId = userRes.rows[0].id;

    // Insert each default message only if it doesn't already exist
    for (const msg of defaultMessages) {
      const exists = await pool.query(
        'SELECT 1 FROM messages WHERE title = $1 AND body = $2 LIMIT 1',
        [msg.title, msg.body]
      );
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO messages (user_id, title, body) VALUES ($1, $2, $3)',
          [userId, msg.title, msg.body]
        );
      }
    }

    console.log('Default messages ensured.');
  } catch (err) {
    console.error('Error inserting default messages:', err);
  }
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  upgradeUserToMember,
  getAllMessages,
  createMessage,
  deleteMessageById,
  insertDefaultMessages, // Exported to be called from app.js
};
