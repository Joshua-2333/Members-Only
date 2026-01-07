// db/pool.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Members-Only external URL
  ssl: {
    rejectUnauthorized: false, // Required for Render/Postgres
  },
});

module.exports = pool;
