import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { users } from '@/lib/db/user-schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.userId;
  const { id } = await params;

  let subscriptionData: any = null;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user from clerkId
  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (user.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    subscriptionData = await request.json();

    // Convert dueDate string to Date object if present
    if (
      subscriptionData.dueDate &&
      typeof subscriptionData.dueDate === 'string'
    ) {
      subscriptionData.dueDate = new Date(subscriptionData.dueDate);
    }

    // Check if subscription exists and belongs to user
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, parseInt(id)))
      .limit(1);

    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // RLS: User can only update their own subscriptions
    if (existingSubscription[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied - you can only update your own subscriptions' },
        { status: 403 }
      );
    }

    // Update the subscription
    const updatedSubscription = await db
      .update(subscriptions)
      .set({
        ...subscriptionData,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, parseInt(id)))
      .returning();

    if (updatedSubscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedSubscription[0] });
  } catch (error) {
    console.error('Error updating subscription:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type',
      subscriptionData: subscriptionData,
    });
    return NextResponse.json(
      {
        error: 'Failed to update subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.userId;
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from clerkId
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if subscription exists and belongs to user
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, parseInt(id)))
      .limit(1);

    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // RLS: User can only delete their own subscriptions
    if (existingSubscription[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied - you can only delete your own subscriptions' },
        { status: 403 }
      );
    }

    // Delete the subscription
    const deletedSubscription = await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, parseInt(id)))
      .returning();

    if (deletedSubscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
