CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"email" text NOT NULL,
	"functions" text NOT NULL,
	"payment" integer NOT NULL,
	"due_date" text NOT NULL,
	"frequency" text NOT NULL,
	"logo" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
