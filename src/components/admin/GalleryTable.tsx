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
import { formatDate } from "@/lib/utils";
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
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");

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
  }

  async function handleEdit(): Promise<void> {
    if (!editingPhoto) return;
    await updatePhoto.mutateAsync({
      id: editingPhoto.id,
      data: {
        title: editTitle,
        description: editDescription || undefined,
        category: editCategory || undefined,
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
                    <Image
                      src={photo.url}
                      alt={photo.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">
                  {photo.title}
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
