import { db } from '@/lib/db';
import { organizationMembers } from '@/lib/db/organization-schema';
import { users } from '@/lib/db/user-schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/organizations/[organizationId]/members - Get organization members
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;

    // Check if user is a member of the organization
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get organization members with user details
    const members = await db
      .select({
        id: organizationMembers.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: organizationMembers.role,
        joinedAt: organizationMembers.joinedAt,
      })
      .from(organizationMembers)
      .leftJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, organizationId));

    // Transform to match expected interface
    const transformedMembers = members.map((member) => ({
      id: member.id,
      name:
        member.firstName && member.lastName
          ? `${member.firstName} ${member.lastName}`
          : member.firstName || member.email || 'Unknown User',
      email: member.email || 'unknown@example.com',
      role: member.role === 'admin' ? 'org:admin' : 'member',
      joinedAt: member.joinedAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      members: transformedMembers,
      total: transformedMembers.length,
    });
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    );
  }
}
