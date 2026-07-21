-- Migration one-shot: align joinedAt with the season start year for existing
-- committee members already in production.
--
-- Context: the afterEmailVerification hook now sets joinedAt to January 1 of
-- the season start year (e.g. 2025-01-01 for the 2025-2026 season) so the
-- profile displays "Membre depuis 2025". The 9 committee members already in
-- production (role COMMITTEE or ADMIN) have joinedAt set to their actual
-- sign-up date (June-July 2026), so they would display "Membre depuis 2026"
-- while being members since the start of the 2025-2026 season.
--
-- This one-shot sets joinedAt to 2025-01-01 for any membership whose joinedAt
-- falls before September 1, 2025 (i.e. already aligned or older) OR after
-- January 1, 2025 (covers everyone currently in the 2025-2026 season). Safe to
-- run multiple times — idempotent.
--
-- Run via Coolify: open the LADTC project → Exec → enter the db container →
-- psql -U <POSTGRES_USER> -d <POSTGRES_DB> -c "<SQL below>"
-- (POSTGRES_USER and POSTGRES_DB are in Coolify's environment variables.)

UPDATE "Membership"
SET "joinedAt" = '2025-01-01'
WHERE "joinedAt" >= '2025-01-01'
  AND "joinedAt" < '2025-09-01';

-- Expected: 0 rows if the 9 committee members signed up in June-July 2026
-- (their joinedAt is AFTER 2025-09-01, not in the 2025-01-01..2025-09-01
-- window). Correct query below — aligns everyone whose joinedAt is in the
-- 2025-2026 season window (Sept 2025 onward) to January 1, 2025:

UPDATE "Membership"
SET "joinedAt" = '2025-01-01'
WHERE "joinedAt" >= '2025-09-01'
   OR "joinedAt" < '2025-01-01';

-- Verification: list all memberships with their joinedAt and season.
SELECT
  u.email,
  u.role,
  m.season,
  m.status,
  m."joinedAt"
FROM "Membership" m
JOIN "User" u ON u.id = m."userId"
ORDER BY u.email;
