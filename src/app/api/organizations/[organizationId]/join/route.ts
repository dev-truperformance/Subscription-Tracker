import { db } from '@/lib/db';
import {
  organizationMembers,
  organizations,
} from '@/lib/db/organization-schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/organizations/[organizationId]/join - Join an organization
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = await params;

    // Get organization details
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      );

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // For private organizations, check if user can join
    if (!organization.isPublic) {
      // Get user's email from Clerk
      const user = await (
        await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        })
      ).json();

      const userEmail = user.email_addresses?.[0]?.email_address;

      if (!userEmail) {
        return NextResponse.json(
          { error: 'User email not found' },
          { status: 400 }
        );
      }

      // Check allowed domains if specified
      if (organization.allowedDomains) {
        const allowedDomains = organization.allowedDomains
          .split(',')
          .map((d: string) => d.trim());
        const userDomain = userEmail.split('@')[1];

        if (!allowedDomains.includes(userDomain)) {
          return NextResponse.json(
            { error: 'Email domain not allowed for this organization' },
            { status: 403 }
          );
        }
      }
    }

    // Add user as member with Clerk membership ID
    const clerkMembershipId = `org_${organizationId}_user_${userId}_${Date.now()}`;

    await db.insert(organizationMembers).values({
      organizationId,
      userId,
      clerkMembershipId,
      role: 'member',
    });

    return NextResponse.json({ message: 'Successfully joined organization' });
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json(
      { error: 'Failed to join organization' },
      { status: 500 }
    );
  }
}
