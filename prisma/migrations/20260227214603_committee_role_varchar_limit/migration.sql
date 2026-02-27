/*
  Warnings:

  - You are about to alter the column `committeeRole` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "committeeRole" SET DATA TYPE VARCHAR(100);
