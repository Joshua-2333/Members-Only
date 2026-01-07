const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use the full external URL from Render
  ssl: {
    rejectUnauthorized: false, // Needed for Render/Postgres SSL
  },
});

module.exports = pool;
