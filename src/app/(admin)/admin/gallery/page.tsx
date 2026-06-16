"use client";

import Link from "next/link";
import { useAdminGallery } from "@/hooks/use-gallery";
import { GalleryTable } from "@/components/admin/gallery/GalleryTable";
import { AlbumManager } from "@/components/admin/gallery/AlbumManager";
import { Button } from "@/components/ui/button";

/**
 * Admin gallery management page.
 */
export default function AdminGalleryPage(): React.ReactNode {
  const { data, isLoading, isError } = useAdminGallery();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-foreground">Galerie</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/gallery/upload?mode=link">
              Ajouter un lien Nextcloud / YouTube
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/gallery/upload">Uploader des fichiers</Link>
          </Button>
        </div>
      </div>

      <AlbumManager />

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
