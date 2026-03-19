import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function runMigrations() {
  try {
    // Create users table
    await db.execute(sql`
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
    `);

    // Create subscriptions table with user_id
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "name" text NOT NULL,
        "url" text NOT NULL,
        "email" text NOT NULL,
        "functions" text NOT NULL,
        "payment" integer NOT NULL,
        "due_date" text NOT NULL,
        "frequency" text NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
