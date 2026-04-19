-- AlterTable: Replace renewalDate with season-based membership
-- Season format: "YYYY-YYYY" (e.g. "2025-2026"), runs Sept 1 to Aug 31

-- Step 1: Add the new season column
ALTER TABLE "Membership" ADD COLUMN "season" TEXT;

-- Step 2: Migrate existing data — derive season from renewalDate
-- renewalDate was set to ~1 year ahead, so the season was the year before renewalDate to renewalDate year
UPDATE "Membership"
SET "season" = CONCAT(
  EXTRACT(YEAR FROM "renewalDate")::int - 1,
  '-',
  EXTRACT(YEAR FROM "renewalDate")::int
)
WHERE "renewalDate" IS NOT NULL;

-- Step 3: Drop the old column and its index
DROP INDEX IF EXISTS "Membership_renewalDate_idx";
ALTER TABLE "Membership" DROP COLUMN "renewalDate";

-- Step 4: Create index on the new column
CREATE INDEX "Membership_season_idx" ON "Membership"("season");
