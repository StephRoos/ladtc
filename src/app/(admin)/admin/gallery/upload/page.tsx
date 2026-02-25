"use client";

import { GalleryUploadForm } from "@/components/admin/GalleryUploadForm";

/**
 * Admin gallery upload page.
 */
export default function AdminGalleryUploadPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        Ajouter des photos
      </h1>
      <GalleryUploadForm />
    </div>
  );
}
