import { Pool } from "pg";

// Force SSL mode in the connection URL
const connectionUrl = process.env.DATABASE_URL?.replace('?sslmode=require', '?ssl=true');

const pool = new Pool({
  connectionString: connectionUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;

// Test the connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.connect().then(client => {
  console.log('✅ Connected to PostgreSQL database');
  client.release();
}).catch(err => {
  console.error('❌ Could not connect to PostgreSQL:', err);
});
