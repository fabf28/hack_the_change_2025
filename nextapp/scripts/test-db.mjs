import pool from '../server/db.js';

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
  } catch (err) {
    console.error('Database connection test failed:', err);
  } finally {
    await pool.end();
  }
}

testConnection();