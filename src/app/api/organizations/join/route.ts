import { db } from '@/lib/db';
import {
  organizationMembers,
  organizations,
} from '@/lib/db/organization-schema';
import { users } from '@/lib/db/user-schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/organizations/join - Join an organization
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Check if organization exists
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get user's internal UUID from Clerk ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already a member
    const [existingMembership] = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id))
      .limit(1);

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Already a member of this organization' },
        { status: 400 }
      );
    }

    // For now, allow joining any organization (you might want to add restrictions based on visibility)
    // Add user as a member
    await db.insert(organizationMembers).values({
      organizationId,
      userId: user.id, // Use internal UUID
      clerkMembershipId: `cm_${userId}_${organizationId}`, // Generate unique membership ID
      role: 'member', // Default role for new members
    });

    return NextResponse.json({
      message: 'Successfully joined organization',
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
      },
    });
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json(
      { error: 'Failed to join organization' },
      { status: 500 }
    );
  }
}
