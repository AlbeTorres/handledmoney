CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text,
	"count" integer,
	"last_request" bigint NOT NULL
);
--> statement-breakpoint
DROP TABLE "ratelimit" CASCADE;