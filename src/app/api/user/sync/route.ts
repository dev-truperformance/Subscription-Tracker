import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/user-schema';
import { eq } from 'drizzle-orm';

// POST /api/user/sync - Sync user to database
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Clerk (you might need to use Clerk's API to get more details)
    // For now, we'll just ensure the user exists in our database
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!existingUser) {
      // Create user in database
      await db.insert(users).values({
        clerkId: userId,
        email: 'user@example.com', // You might want to get this from Clerk
        firstName: 'User',
        lastName: 'Name',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
