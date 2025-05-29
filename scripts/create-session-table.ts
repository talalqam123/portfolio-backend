import { pool } from '../src/db';

async function runMigrations() {
  try {
    // Create session table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
    `);
    console.log('Session table created successfully');

    // Add website_url column
    await pool.query(`
      ALTER TABLE case_studies
      ADD COLUMN IF NOT EXISTS website_url text;
    `);
    console.log('Website URL column added successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations(); 