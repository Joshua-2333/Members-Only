// db/pool.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'josh2333',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'members_only',
  password: process.env.DB_PASSWORD || 'supersecretpassword',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
