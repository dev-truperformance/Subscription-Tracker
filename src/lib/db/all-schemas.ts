import { subscriptions } from './schema';
import { users } from './user-schema';
import { organizations, organizationMembers } from './organization-schema';

export const schema = {
  subscriptions,
  users,
  organizations,
  organizationMembers,
};

export * from './schema';
export * from './user-schema';
export * from './organization-schema';
