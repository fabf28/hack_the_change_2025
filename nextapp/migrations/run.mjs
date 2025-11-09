import { pool } from '../server/db';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  try {
    // Get all SQL files
    const files = await fs.readdir(__dirname);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Run in alphabetical order

    // Run each file
    for (const file of sqlFiles) {
      console.log(`Running migration: ${file}`);
      const sql = await fs.readFile(
        path.join(__dirname, file),
        'utf-8'
      );
      await pool.query(sql);
      console.log(`✓ Completed: ${file}`);
    }

    console.log('All migrations completed successfully!');
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();