-- Some development databases were created with `drizzle-kit push`, which already
-- created the snake_case table without ever creating the legacy camelCase table.
-- Keep this historical migration safe for both database histories.
DO $$
BEGIN
  IF to_regclass('public."rateLimit"') IS NOT NULL
     AND to_regclass('public.rate_limit') IS NULL THEN
    ALTER TABLE "rateLimit" RENAME TO "rate_limit";
  END IF;
END $$;
