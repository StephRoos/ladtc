-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK');

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL DEFAULT 'FACEBOOK',
    "externalId" TEXT NOT NULL,
    "authorName" TEXT,
    "authorUrl" TEXT,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "permalink" TEXT,
    "postedAt" TIMESTAMP(3),
    "reactions" INTEGER,
    "comments" INTEGER,
    "sharedFrom" TEXT,
    "blogPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialPost_externalId_key" ON "SocialPost"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialPost_blogPostId_key" ON "SocialPost"("blogPostId");

-- CreateIndex
CREATE INDEX "SocialPost_postedAt_idx" ON "SocialPost"("postedAt" DESC);

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
