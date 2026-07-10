ALTER TABLE "two_factor" ADD COLUMN "verified" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "two_factor" ADD COLUMN "failed_verification_count" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "two_factor" ADD COLUMN "locked_until" timestamp (6) with time zone;