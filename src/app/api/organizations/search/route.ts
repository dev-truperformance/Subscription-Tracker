import { db } from '@/lib/db';
import { organizations } from '@/lib/db/organization-schema';
import { auth } from '@clerk/nextjs/server';
import { eq, ilike, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/organizations/search?q=query - Search organizations
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json({ organizations: [] });
    }

    // Search organizations by name or ID
    // For UUID ID, we need to check if the query looks like a UUID and use exact match
    const isUuidLike =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        query
      );

    const searchResults = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
        isPublic: organizations.isPublic,
        allowedDomains: organizations.allowedDomains,
        createdAt: organizations.createdAt,
      })
      .from(organizations)
      .where(
        or(
          ilike(organizations.name, `%${query}%`),
          ilike(organizations.clerkOrganizationId, `%${query}%`),
          isUuidLike ? eq(organizations.id, query) : undefined
        )
      )
      .limit(10);

    // Transform results to include additional info
    const transformedResults = searchResults.map((org) => ({
      ...org,
      visibility: org.isPublic ? 'public' : 'private',
      isPublic: org.isPublic,
      allowedDomains: org.isPublic ? null : org.allowedDomains,
    }));

    return NextResponse.json({ organizations: transformedResults });
  } catch (error) {
    console.error('Error searching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to search organizations' },
      { status: 500 }
    );
  }
}
