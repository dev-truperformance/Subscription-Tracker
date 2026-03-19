import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { subscriptions, Subscription, NewSubscription } from './schema';
import { users, User, NewUser } from './user-schema';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, {
  schema: { subscriptions, users }
});

export type { Subscription, NewSubscription, User, NewUser };
