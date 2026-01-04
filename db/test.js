const pool = require('./pool');

(async () => {
  const res = await pool.query('SELECT NOW()');
  console.log(res.rows);
  process.exit();
})();
