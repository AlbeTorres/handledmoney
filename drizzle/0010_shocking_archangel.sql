ALTER TABLE "two_factor" ALTER COLUMN "verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "two_factor" ALTER COLUMN "failed_verification_count" SET DEFAULT 0;