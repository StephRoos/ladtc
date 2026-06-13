-- Membership dues default raised from 50 to 55 EUR for the new season
-- (committee decision 2026-06-12). Existing rows keep their current amount.
ALTER TABLE "Membership" ALTER COLUMN "amount" SET DEFAULT 55.0;
