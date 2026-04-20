-- Migrate existing COACH users to COMMITTEE
UPDATE "User" SET "role" = 'COMMITTEE' WHERE "role" = 'COACH';

-- Remove COACH from the UserRole enum
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'COMMITTEE', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
DROP TYPE "UserRole_old";
