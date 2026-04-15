import { db } from '@/lib/db';
import {
  organizationMembers,
  organizations,
} from '@/lib/db/organization-schema';
import { users } from '@/lib/db/user-schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/organizations/[organizationId] - Get organization details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = await params;

    // Get user's internal UUID from Clerk ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is a member of the organization
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, user.id)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get organization details
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

    // Transform to match expected interface
    const transformedOrg = {
      id: org.id,
      name: org.name,
      slug: org.name.toLowerCase().replace(/\s+/g, '-'),
      type: org.type,
      plan: 'free', // Default plan
      maxSubscriptions: 10, // Default max subscriptions
      createdAt: org.createdAt?.toISOString() || new Date().toISOString(),
      role: membership[0].role === 'admin' ? 'org:admin' : 'member',
    };

    return NextResponse.json({
      success: true,
      organization: transformedOrg,
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[organizationId] - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { userId } = await auth();
    const { organizationId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Check if user is an admin of the organization
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, user.id),
          eq(organizationMembers.role, 'admin')
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete organization members first
    await db
      .delete(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId));

    // Delete organization
    await db.delete(organizations).where(eq(organizations.id, organizationId));

    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
