import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/user-schema';
import { eq } from 'drizzle-orm';

// POST /api/user/resync - Force resync user data from Clerk
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      );
    }

    // Check if user exists in our database
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!existingUser) {
      // Create user in database with actual Clerk data
      await db.insert(users).values({
        clerkId: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
      });
    } else {
      // Update existing user with latest Clerk data
      await db
        .update(users)
        .set({
          email:
            clerkUser.primaryEmailAddress?.emailAddress || existingUser.email,
          firstName: clerkUser.firstName || existingUser.firstName,
          lastName: clerkUser.lastName || existingUser.lastName,
        })
        .where(eq(users.clerkId, userId));
    }

    return NextResponse.json({
      success: true,
      userData: {
        clerkId: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        fullName: clerkUser.fullName,
      },
    });
  } catch (error) {
    console.error('Error resyncing user:', error);
    return NextResponse.json(
      { error: 'Failed to resync user' },
      { status: 500 }
    );
  }
}
