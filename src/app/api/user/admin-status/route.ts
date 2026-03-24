import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/user-schema';
import { organizationMembers } from '@/lib/db/organization-schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { isAdmin: false, organizationId: null },
        { status: 401 }
      );
    }

    // Get user's internal UUID from Clerk ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ isAdmin: false, organizationId: null });
    }

    // Check if user is admin in any organization
    const [adminMembership] = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id))
      .limit(1);

    const isAdmin =
      adminMembership?.role === 'admin' ||
      adminMembership?.role === 'org:admin';

    return NextResponse.json({
      isAdmin: isAdmin || false,
      organizationId: adminMembership?.organizationId || null,
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { isAdmin: false, organizationId: null },
      { status: 500 }
    );
  }
}
