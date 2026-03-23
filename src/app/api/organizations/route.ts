import { db } from '@/lib/db';
import {
  organizationMembers,
  organizations,
} from '@/lib/db/organization-schema';
import { users } from '@/lib/db/user-schema';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to map database roles to organization roles
function mapDbRoleToOrgRole(dbRole: string): 'org:admin' | 'member' {
  switch (dbRole) {
    case 'admin':
    case 'owner':
    case 'org:admin':
      return 'org:admin';
    case 'member':
    case 'org:member':
    default:
      return 'member';
  }
}

// GET /api/organizations - Get user's organizations
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Organizations API: Starting request...');

    const { userId } = await auth();
    console.log('🔍 Organizations API: User ID:', userId);

    if (!userId) {
      console.log('❌ Organizations API: No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Organizations API: Fetching organizations from DB...');
    // Get organizations from our database first
    const dbOrganizations = await db.select().from(organizations);
    console.log(
      '🔍 Organizations API: Found organizations:',
      dbOrganizations.length
    );

    console.log('🔍 Organizations API: Fetching user from DB...');
    // Get user from our database
    let dbUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);
    console.log('🔍 Organizations API: User found:', dbUser.length > 0);

    if (!dbUser.length) {
      console.log('🔍 Organizations API: Creating new user...');
      // Create user if doesn't exist
      await db.insert(users).values({
        clerkId: userId,
        email: '', // Will be updated later
        firstName: null,
        lastName: null,
        avatar: null,
      });

      // Fetch the newly created user
      dbUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1);
      console.log('🔍 Organizations API: New user created:', dbUser.length > 0);
    }

    console.log('🔍 Organizations API: Fetching user memberships...');
    // Get user's roles for each organization
    const userMemberships = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, dbUser[0].id));
    console.log(
      '🔍 Organizations API: Found memberships:',
      userMemberships.length
    );

    const membershipMap = new Map(
      userMemberships.map((membership) => [
        membership.organizationId,
        membership,
      ])
    );

    const organizationsWithRoles = [];
    for (const org of dbOrganizations) {
      const userMembership = membershipMap.get(org.id);

      if (userMembership) {
        organizationsWithRoles.push({
          id: org.id,
          clerkOrganizationId: org.clerkOrganizationId,
          name: org.name,
          slug: org.slug,
          type: org.type,
          plan: org.plan,
          maxSubscriptions: org.maxSubscriptions,
          allowedDomains: org.allowedDomains || [],
          isPublic: org.isPublic,
          createdAt: org.createdAt.toISOString(),
          updatedAt: org.updatedAt.toISOString(),
          role: mapDbRoleToOrgRole(userMembership.role),
        });
      }
    }

    console.log(
      '🔍 Organizations API: Final organizations with roles:',
      organizationsWithRoles.length
    );
    console.log('🔍 Organizations API: Sending response...');

    return NextResponse.json({
      success: true,
      organizations: organizationsWithRoles,
    });
  } catch (error) {
    console.error('❌ Organizations API: Error fetching organizations:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch organizations',
      },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, isPublic } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    // Get user's email to extract domain for private organizations
    const dbUser = await db
      .select({ email: users.email, id: users.id })
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!dbUser.length) {
      throw new Error('User not found in database');
    }

    const userEmail = dbUser[0]?.email || '';
    const userDomain = userEmail.includes('@') ? userEmail.split('@')[1] : '';

    // For private organizations, automatically set allowed domains to user's email domain
    const allowedDomains = isPublic ? null : userDomain;

    // Create organization in Clerk with createdBy
    const clerk = await clerkClient();
    const clerkOrg = await clerk.organizations.createOrganization({
      name,
      createdBy: userId,
    });

    // Save organization in your DB
    const [newOrg] = await db
      .insert(organizations)
      .values({
        clerkOrganizationId: clerkOrg.id,
        name: clerkOrg.name,
        slug: clerkOrg.slug ?? '',
        type: type ?? 'personal',
        plan: type === 'enterprise' ? 'pro' : type === 'team' ? 'team' : 'free',
        maxSubscriptions:
          type === 'enterprise' ? 100 : type === 'team' ? 20 : 5,
        allowedDomains: allowedDomains,
        isPublic: isPublic ?? false,
      })
      .returning();

    // Clerk automatically creates membership, get it
    const memberships = await clerk.organizations.getOrganizationMembershipList(
      {
        organizationId: clerkOrg.id,
      }
    );

    const userMembership = memberships.data.find(
      (m: any) => m.publicUserData?.userId === userId
    );

    // Add membership record to your DB
    if (userMembership) {
      await db.insert(organizationMembers).values({
        userId: dbUser[0].id,
        organizationId: newOrg.id,
        role: userMembership.role,
        clerkMembershipId: userMembership.id,
        joinedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: newOrg.id,
        clerkOrganizationId: clerkOrg.id,
        name: clerkOrg.name,
        slug: clerkOrg.slug ?? '',
        type: type ?? 'personal',
        plan: type === 'enterprise' ? 'pro' : 'free',
        maxSubscriptions:
          type === 'enterprise' ? 100 : type === 'team' ? 20 : 5,
        createdAt: newOrg.createdAt,
        updatedAt: newOrg.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create organization',
      },
      { status: 500 }
    );
  }
}
