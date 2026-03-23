import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './user-schema';

// Organizations table
export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    clerkOrganizationId: varchar('clerk_organization_id', {
      length: 255,
    })
      .unique()
      .notNull(),

    name: varchar('name', { length: 255 }).notNull(),

    slug: varchar('slug', { length: 255 }).unique().notNull(),

    type: varchar('type', { length: 20 }).default('personal').notNull(),

    plan: varchar('plan', { length: 50 }).default('free').notNull(),

    maxSubscriptions: integer('max_subscriptions').default(5),

    allowedDomains: text('allowed_domains'),

    isPublic: boolean('is_public').default(false),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: index('organizations_slug_idx').on(table.slug),
  })
);

// Organization members table
export const organizationMembers = pgTable(
  'organization_members',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),

    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    clerkMembershipId: varchar('clerk_membership_id', {
      length: 255,
    })
      .unique()
      .notNull(),

    role: varchar('role', { length: 20 }).default('member').notNull(),

    joinedAt: timestamp('joined_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgIdx: index('org_members_org_idx').on(table.organizationId),
    userIdx: index('org_members_user_idx').on(table.userId),
  })
);

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
  })
);

// Types
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;
