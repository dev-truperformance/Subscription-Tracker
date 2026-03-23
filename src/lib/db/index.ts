import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  NewOrganization,
  NewOrganizationMember,
  Organization,
  OrganizationMember,
  organizationMembers,
  organizations,
} from './organization-schema';
import { NewSubscription, Subscription, subscriptions } from './schema';
import { NewUser, User, users } from './user-schema';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, {
  schema: { subscriptions, users, organizations, organizationMembers },
});

export type {
  NewOrganization,
  NewOrganizationMember,
  NewSubscription,
  NewUser,
  Organization,
  OrganizationMember,
  Subscription,
  User,
};

// Export schema for Drizzle Kit
export const schema = {
  subscriptions,
  users,
  organizations,
  organizationMembers,
};
