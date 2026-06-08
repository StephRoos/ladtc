-- Add media type support to the gallery (images + videos).
-- Existing rows default to IMAGE so behaviour is unchanged for current photos.

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "GalleryPhoto" ADD COLUMN "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE';
