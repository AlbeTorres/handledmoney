CREATE TYPE "public"."category_type" AS ENUM('income', 'expense');--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "icon" varchar(100);--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "color" varchar(7);--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "type" "category_type" DEFAULT 'expense' NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;