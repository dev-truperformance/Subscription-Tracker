import { NextRequest, NextResponse } from 'next/server';
import { db, User, NewUser } from '@/lib/db';
import { users } from '@/lib/db/user-schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');
    
    if (!clerkId) {
      return NextResponse.json({ error: 'clerkId is required' }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user[0] });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerkId, email, firstName, lastName, avatar } = body;

    if (!clerkId || !email) {
      return NextResponse.json({ error: 'clerkId and email are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    
    if (existingUser.length > 0) {
      // Update existing user
      const updatedUser = await db
        .update(users)
        .set({ email, firstName, lastName, avatar, updatedAt: new Date() })
        .where(eq(users.clerkId, clerkId))
        .returning();
      return NextResponse.json({ data: updatedUser[0] });
    }

    // Create new user
    const newUser: NewUser = {
      clerkId,
      email,
      firstName,
      lastName,
      avatar,
    };

    const createdUser = await db.insert(users).values(newUser).returning();
    return NextResponse.json({ data: createdUser[0] }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to save user' },
      { status: 500 }
    );
  }
}
