import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import {
  organizations,
  organizationMembers,
} from '@/lib/db/organization-schema';
import { eq } from 'drizzle-orm';

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

    // Check if user is already a member
    const [existingMembership] = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId))
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
      userId,
      role: 'member', // Default role for new members
    });

    // Update member count
    await db
      .update(organizations)
      .set({
        memberCount: (org.memberCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId));

    return NextResponse.json({
      success: true,
      message: 'Successfully joined organization',
      isOwner: false, // User is joining, not the owner
    });
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json(
      { error: 'Failed to join organization' },
      { status: 500 }
    );
  }
}
