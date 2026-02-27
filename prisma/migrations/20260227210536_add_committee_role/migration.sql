-- CreateEnum
CREATE TYPE "CommitteeRole" AS ENUM ('PRESIDENT', 'VICE_PRESIDENT', 'TREASURER', 'SECRETARY', 'COMMUNICATIONS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "committeeRole" "CommitteeRole";
