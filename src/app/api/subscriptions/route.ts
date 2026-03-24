import { db } from '@/lib/db';
import { organizationMembers } from '@/lib/db/organization-schema';
import { subscriptions } from '@/lib/db/schema';
import { users } from '@/lib/db/user-schema';
import { auth } from '@clerk/nextjs/server';
import { eq, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from clerkId
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ data: [] });
    }

    // Get all organization memberships for this user
    const userOrgMemberships = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id));

    if (userOrgMemberships.length === 0) {
      // User is not in any organization, return only their subscriptions
      const userSubscriptions = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));
      return NextResponse.json({ data: userSubscriptions });
    }

    // Get all user IDs from the same organizations
    const organizationIds = userOrgMemberships.map(
      (membership) => membership.organizationId
    );
    const organizationUserIds = await db
      .select({ userId: organizationMembers.userId })
      .from(organizationMembers)
      .where(inArray(organizationMembers.organizationId, organizationIds));

    // Get the clerk IDs for these users
    const clerkIds = await db
      .select({ clerkId: users.clerkId })
      .from(users)
      .where(
        inArray(
          users.id,
          organizationUserIds.map((u) => u.userId)
        )
      );

    // Get all subscriptions from all organization members with user details
    const organizationSubscriptions = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        name: subscriptions.name,
        email: subscriptions.email,
        functions: subscriptions.functions,
        payment: subscriptions.payment,
        dueDate: subscriptions.dueDate,
        frequency: subscriptions.frequency,
        reminderHistory: subscriptions.reminderHistory,
        lastReminderAt: subscriptions.lastReminderAt,
        status: subscriptions.status,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.clerkId))
      .where(
        inArray(
          subscriptions.userId,
          clerkIds.map((u) => u.clerkId)
        )
      );

    // Transform to include user details
    const transformedSubscriptions = organizationSubscriptions.map((sub) => ({
      ...sub,
      user:
        sub.userFirstName || sub.userLastName || sub.userEmail
          ? {
              firstName: sub.userFirstName,
              lastName: sub.userLastName,
              email: sub.userEmail || '',
            }
          : undefined,
    }));

    // Remove the user fields from the main object
    const cleanSubscriptions = transformedSubscriptions.map(
      ({ userFirstName, userLastName, userEmail, ...rest }) => rest
    );

    return NextResponse.json({ data: cleanSubscriptions });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Get user from clerkId
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscriptionWithUser = {
      ...body,
      userId: userId,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    };

    const newSubscription = await db
      .insert(subscriptions)
      .values(subscriptionWithUser)
      .returning();
    return NextResponse.json({ data: newSubscription[0] }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
