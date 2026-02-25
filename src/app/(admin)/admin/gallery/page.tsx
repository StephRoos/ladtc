"use client";

import Link from "next/link";
import { useAdminGallery } from "@/hooks/use-gallery";
import { GalleryTable } from "@/components/admin/GalleryTable";
import { Button } from "@/components/ui/button";

/**
 * Admin gallery management page.
 */
export default function AdminGalleryPage(): React.ReactNode {
  const { data, isLoading, isError } = useAdminGallery();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Galerie</h1>
        <Button asChild>
          <Link href="/admin/gallery/upload">Ajouter des photos</Link>
        </Button>
      </div>

      {isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-4 text-destructive">
          Impossible de charger les photos.
        </div>
      ) : (
        <GalleryTable photos={data?.photos ?? []} isLoading={isLoading} />
      )}
    </div>
  );
}
