"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDeletePhoto, useUpdatePhoto } from "@/hooks/use-gallery";
import { useAdminAlbums } from "@/hooks/use-gallery-albums";
import { parseVideoEmbed } from "@/lib/video-embed";
import { formatDate } from "@/lib/utils";
import { Play, Folder } from "lucide-react";
import type { GalleryPhoto } from "@/types";

interface GalleryTableProps {
  photos: GalleryPhoto[];
  isLoading?: boolean;
}

/**
 * Gallery photos table for admin management with edit and delete actions.
 */
export function GalleryTable({
  photos,
  isLoading = false,
}: GalleryTableProps): React.ReactNode {
  const deletePhoto = useDeletePhoto();
  const updatePhoto = useUpdatePhoto();
  const { data: albums } = useAdminAlbums();
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAlbumId, setEditAlbumId] = useState("");

  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
        Aucune photo dans la galerie.
      </div>
    );
  }

  function openEdit(photo: GalleryPhoto): void {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditDescription(photo.description ?? "");
    setEditCategory(photo.category ?? "");
    setEditAlbumId(photo.albumId ?? "");
  }

  async function handleEdit(): Promise<void> {
    if (!editingPhoto) return;
    await updatePhoto.mutateAsync({
      id: editingPhoto.id,
      data: {
        title: editTitle,
        description: editDescription || undefined,
        category: editCategory || undefined,
        // Always sent (even ""): an empty value removes the photo from its album.
        albumId: editAlbumId,
      },
    });
    setEditingPhoto(null);
  }

  async function handleDelete(id: string, title: string): Promise<void> {
    if (!confirm(`Supprimer la photo « ${title} » ?`)) return;
    await deletePhoto.mutateAsync(id);
  }

  return (
    <>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {photos.map((photo) => (
              <TableRow key={photo.id}>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded border border-border">
                    {(() => {
                      const embed = parseVideoEmbed(photo.url);
                      if (embed || photo.mediaType === "VIDEO") {
                        return (
                          <>
                            {embed?.thumbnailUrl ? (
                              <Image
                                src={embed.thumbnailUrl}
                                alt={photo.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : embed ? (
                              <div className="h-full w-full bg-muted" />
                            ) : (
                              <video
                                src={photo.url}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                              />
                            )}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                              <Play className="h-4 w-4 fill-current" />
                            </span>
                          </>
                        );
                      }
                      return (
                        <Image
                          src={photo.url}
                          alt={photo.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      );
                    })()}
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="truncate font-medium">{photo.title}</p>
                  {photo.album && (
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Folder className="h-3 w-3 shrink-0" />
                      {photo.album.name}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {photo.category ? (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary text-xs"
                    >
                      {photo.category}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(photo.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(photo)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(photo.id, photo.title)}
                      disabled={deletePhoto.isPending}
                    >
                      Supprimer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog */}
      <Dialog
        open={editingPhoto !== null}
        onOpenChange={(open) => !open && setEditingPhoto(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Titre</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-album">Album / événement</Label>
              <select
                id="edit-album"
                value={editAlbumId}
                onChange={(e) => setEditAlbumId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">— Aucun album —</option>
                {albums?.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-category">Catégorie</Label>
              <Input
                id="edit-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingPhoto(null)}
              disabled={updatePhoto.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updatePhoto.isPending || !editTitle.trim()}
            >
              {updatePhoto.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
