-- Merge the admin permission level into committee: the committee now manages
-- everything (accounts and roles included). Existing ADMIN users become COMMITTEE.
-- The ADMIN enum value is kept as a dormant legacy value (no enum recreation).
UPDATE "User" SET "role" = 'COMMITTEE' WHERE "role" = 'ADMIN';
