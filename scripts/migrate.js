require('dotenv').config();
const postgres = require('postgres');

async function runMigrations() {
  try {
    const connectionString = process.env.DATABASE_URL;
    console.log('Running migrations...');
    
    if (!connectionString) {
      console.error('❌ DATABASE_URL is not set');
      process.exit(1);
    }
    
    const client = postgres(connectionString);

    // Create users table
    await client`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "clerk_id" text NOT NULL UNIQUE,
        "email" text NOT NULL UNIQUE,
        "first_name" text,
        "last_name" text,
        "avatar" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `;

    console.log('✅ Users table created');

    // Create subscriptions table with user_id
    await client`
      ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "user_id" text;
    `;

    console.log('✅ Subscriptions table updated with user_id column');

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
