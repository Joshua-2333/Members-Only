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
/* Get all messages (author visible only if member/admin) */
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

/* Delete a message by id (admin only) */
async function deleteMessageById(messageId) {
  const query = `
    DELETE FROM messages
    WHERE id = $1
  `;
  await pool.query(query, [messageId]);
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  upgradeUserToMember,
  getAllMessages,
  createMessage,
  deleteMessageById,
};
