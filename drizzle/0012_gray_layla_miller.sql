-- 0011 owns the budget-lifecycle conversion. Keep this migration additive so a
-- clean database never replays that conversion and a development database that
-- was already synchronized with `drizzle-kit push` can record this migration.
ALTER TABLE "budget" ADD COLUMN IF NOT EXISTS "color" varchar(6);--> statement-breakpoint
UPDATE "budget" SET "color" = '94a3b8' WHERE "color" IS NULL;--> statement-breakpoint
ALTER TABLE "budget" ALTER COLUMN "color" SET DEFAULT '94a3b8';--> statement-breakpoint
ALTER TABLE "budget" ALTER COLUMN "color" SET NOT NULL;
