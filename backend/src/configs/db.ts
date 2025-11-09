import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL environment variable.");
}

// Create a PostgreSQL connection pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Neon
});
