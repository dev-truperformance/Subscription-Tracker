import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/user-schema';
import { eq } from 'drizzle-orm';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not found');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await req.text();

    // For development, we'll parse directly without verification
    // In production, add proper webhook verification
    let evt: WebhookEvent;

    try {
      evt = JSON.parse(body) as WebhookEvent;
    } catch (err) {
      console.error('Failed to parse webhook body:', err);
      return NextResponse.json({ error: 'Invalid webhook body' }, { status: 400 });
    }

    const { type } = evt;

    if (type === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const userData = {
        clerkId: id,
        email: email_addresses[0]?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        avatar: image_url || '',
      };

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.clerkId, id)).limit(1);

      if (existingUser.length === 0) {
        // Create new user
        const newUser = await db.insert(users).values(userData).returning();
        console.log('✅ User created via webhook:', userData.email);
        return NextResponse.json({ data: newUser[0] }, { status: 201 });
      } else {
        console.log('ℹ️ User already exists:', userData.email);
        return NextResponse.json({ data: existingUser[0] });
      }
    }

    if (type === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const userData = {
        email: email_addresses[0]?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        avatar: image_url || '',
      };

      // Update existing user
      const updatedUser = await db
        .update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.clerkId, id))
        .returning();

      console.log('✅ User updated via webhook:', userData.email);
      return NextResponse.json({ data: updatedUser[0] });
    }

    return NextResponse.json({ message: 'Webhook received' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
