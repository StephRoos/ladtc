-- CreateEnum
CREATE TYPE "SponsorTier" AS ENUM ('GOLD', 'SILVER', 'BRONZE');

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "tier" "SponsorTier" NOT NULL DEFAULT 'BRONZE',
    "websiteUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sponsor_tier_idx" ON "Sponsor"("tier");

-- CreateIndex
CREATE INDEX "Sponsor_isActive_idx" ON "Sponsor"("isActive");

-- CreateIndex
CREATE INDEX "Sponsor_order_idx" ON "Sponsor"("order");
