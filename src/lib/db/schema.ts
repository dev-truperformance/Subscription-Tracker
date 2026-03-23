import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),

  userId: text('user_id').notNull(),

  name: text('name').notNull(),

  email: text('email').notNull(),

  functions: text('functions').notNull(),

  payment: text('payment').notNull(),

  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),

  frequency: text('frequency').notNull(),

  reminderHistory: text('reminder_history').array().default([]),
  lastReminderAt: timestamp('last_reminder_at', { withTimezone: true }),

  status: text('status').default('active'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
