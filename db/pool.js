const { Pool } = require('pg');

module.exports = new Pool({
  user: 'josh2333',
  host: 'localhost',
  database: 'members_only',
  password: 'supersecretpassword',
  port: 5432,
});
