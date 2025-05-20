const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://kitchen_db_h87d_user:UWGf1x7vZqCi9Q8wk59jeN4NGiiUEiCp@dpg-d0lekh7fte5s739emnp0-a.singapore-postgres.render.com/kitchen_db_h87d",
  ssl: { rejectUnauthorized: false }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
