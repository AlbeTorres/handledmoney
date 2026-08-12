-- Be safe when a development database was previously synchronized with
-- `drizzle-kit push` but its migration journal was not initialized.
ALTER TABLE "two_factor" ADD COLUMN IF NOT EXISTS "verified" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "two_factor" ADD COLUMN IF NOT EXISTS "failed_verification_count" integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE "two_factor" ADD COLUMN IF NOT EXISTS "locked_until" timestamp (6) with time zone;
