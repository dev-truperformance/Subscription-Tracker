import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import {
  organizations,
  organizationMembers,
} from '@/lib/db/organization-schema';
import { eq, and } from 'drizzle-orm';

// POST /api/organizations/[organizationId]/join - Join an organization
export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;

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

    // For private organizations, check email domain
    if (organization.visibility === 'private') {
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

      // Get organization creator's email domain
      const creator = await (
        await fetch(
          `https://api.clerk.dev/v1/users/${organization.createdBy}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            },
          }
        )
      ).json();

      const creatorEmail = creator.email_addresses?.[0]?.email_address;

      if (!creatorEmail) {
        return NextResponse.json(
          { error: 'Creator email not found' },
          { status: 400 }
        );
      }

      // Check if domains match
      const userDomain = userEmail.split('@')[1];
      const creatorDomain = creatorEmail.split('@')[1];

      if (userDomain !== creatorDomain) {
        return NextResponse.json(
          { error: 'Email domain does not match organization domain' },
          { status: 403 }
        );
      }
    }

    // Add user as member
    await db.insert(organizationMembers).values({
      organizationId,
      userId,
      role: 'member',
    });

    // Update member count
    await db
      .update(organizations)
      .set({
        memberCount: (organization.memberCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId));

    return NextResponse.json({ message: 'Successfully joined organization' });
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json(
      { error: 'Failed to join organization' },
      { status: 500 }
    );
  }
}
