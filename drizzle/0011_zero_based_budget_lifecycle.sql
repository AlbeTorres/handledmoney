-- The application originally used `month`, `year`, and a six-value group enum.
-- This migration also repairs development databases partially changed by
-- `drizzle-kit push`, which may already have renamed those columns but retained
-- their integer/text data. Production data is backfilled before constraints.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'budget_calculation_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE "budget_calculation_type" AS ENUM('income', 'outflow');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'budget' AND column_name = 'month') THEN
    ALTER TABLE "budget" ADD COLUMN IF NOT EXISTS "start_date" timestamp;
    ALTER TABLE "budget" ADD COLUMN IF NOT EXISTS "end_date" timestamp;
    UPDATE "budget"
    SET "start_date" = make_date("year", "month", 1),
        "end_date" = make_date("year", "month", 1) + INTERVAL '1 month - 1 day';
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'budget' AND column_name = 'start_date' AND data_type = 'integer') THEN
    ALTER TABLE "budget" ALTER COLUMN "start_date" DROP NOT NULL;
    ALTER TABLE "budget" ALTER COLUMN "end_date" DROP NOT NULL;
    ALTER TABLE "budget" ALTER COLUMN "start_date" TYPE timestamp USING make_date("end_date", "start_date", 1)::timestamp;
    ALTER TABLE "budget" ALTER COLUMN "end_date" TYPE timestamp USING "start_date" + INTERVAL '1 month - 1 day';
  END IF;

  ALTER TABLE "budget" ALTER COLUMN "start_date" SET NOT NULL;
  ALTER TABLE "budget" ALTER COLUMN "end_date" DROP NOT NULL;
  ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "archived_at" timestamp;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'budget_group' AND column_name = 'calculation_type') THEN
    ALTER TABLE "budget_group" ADD COLUMN "calculation_type" text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'budget_group' AND column_name = 'type') THEN
    UPDATE "budget_group"
    SET "calculation_type" = CASE WHEN "type"::text = 'income' THEN 'income' ELSE 'outflow' END;
  ELSE
    UPDATE "budget_group"
    SET "calculation_type" = CASE WHEN "calculation_type"::text = 'income' THEN 'income' ELSE 'outflow' END;
  END IF;
  ALTER TABLE "budget_group" ALTER COLUMN "calculation_type" TYPE "budget_calculation_type" USING "calculation_type"::"budget_calculation_type";
  ALTER TABLE "budget_group" ALTER COLUMN "calculation_type" SET NOT NULL;

  ALTER TABLE "budget_item" ADD COLUMN IF NOT EXISTS "budget_id" uuid;
  UPDATE "budget_item" SET "budget_id" = "budget_group"."budget_id" FROM "budget_group" WHERE "budget_item"."group_id" = "budget_group"."id" AND "budget_item"."budget_id" IS NULL;
  ALTER TABLE "budget_item" ALTER COLUMN "budget_id" SET NOT NULL;
END $$;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "current_budget" ("user_id" text PRIMARY KEY NOT NULL, "budget_id" uuid, "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL, "deleted_at" timestamp);--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'current_budget_user_id_user_id_fk') THEN
    ALTER TABLE "current_budget" ADD CONSTRAINT "current_budget_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'current_budget_budget_id_budget_id_fk') THEN
    ALTER TABLE "current_budget" ADD CONSTRAINT "current_budget_budget_id_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budget"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'budget_item_budget_id_budget_id_fk') THEN
    ALTER TABLE "budget_item" ADD CONSTRAINT "budget_item_budget_id_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budget"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "budget_item_budget_category_unique" ON "budget_item" USING btree ("budget_id", "category_id");--> statement-breakpoint
DROP INDEX IF EXISTS "budget_userId_year_month_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "budget_userId_startDate_idx" ON "budget" USING btree ("userId", "start_date");--> statement-breakpoint
ALTER TABLE "budget" DROP COLUMN IF EXISTS "month";--> statement-breakpoint
ALTER TABLE "budget" DROP COLUMN IF EXISTS "year";--> statement-breakpoint
ALTER TABLE "budget_group" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
DROP TYPE IF EXISTS "budget_group_type";
