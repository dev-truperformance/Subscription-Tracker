import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function testConnectionAndCreateTables() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful');
    
    // Create organizations table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "organizations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "clerk_organization_id" varchar(255) NOT NULL UNIQUE,
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL UNIQUE,
        "type" varchar(20) DEFAULT 'personal' NOT NULL,
        "plan" varchar(50) DEFAULT 'free' NOT NULL,
        "max_subscriptions" integer DEFAULT 5,
        "allowed_domains" text,
        "is_public" boolean DEFAULT false,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    console.log('✅ Organizations table created/verified');

    // Create organization_members table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "organization_members" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "organization_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" varchar(50) DEFAULT 'member' NOT NULL,
        "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "organization_members_organization_id_user_id_unique" UNIQUE("organization_id", "user_id")
      );
    `);
    console.log('✅ Organization members table created/verified');

    // Create indexes for organizations
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "organizations_slug_idx" ON "organizations" (slug);
    `);
    console.log('✅ Indexes created/verified');

    // Test query on organizations table
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM organizations`);
    console.log(`✅ Organizations table query successful. Found ${result[0]?.count || 0} organizations`);

    console.log('✅ All database operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database operation failed:', error);
    process.exit(1);
  }
}

testConnectionAndCreateTables();
