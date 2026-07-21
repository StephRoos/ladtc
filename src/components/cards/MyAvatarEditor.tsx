"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { useUpdateMyImage } from "@/hooks/use-member";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface MyAvatarEditorProps {
  currentImage: string | null;
  userName: string | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Self-service avatar editor rendered on the /profile page. Opens a dialog
 * with the same ImagePicker used by the admin (upload, gallery, URL), but
 * calls PATCH /api/members/me/image so a member can change their own photo
 * without committee access.
 */
export function MyAvatarEditor({
  currentImage,
  userName,
}: MyAvatarEditorProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const mutation = useUpdateMyImage();

  async function handleSelect(url: string): Promise<void> {
    try {
      await mutation.mutateAsync(url);
      toast.success("Photo de profil mise à jour");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    }
  }

  async function handleRemove(): Promise<void> {
    try {
      await mutation.mutateAsync(null);
      toast.success("Photo de profil supprimée");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Modifier ma photo de profil"
        >
          <Avatar className="h-20 w-20 cursor-pointer transition-opacity hover:opacity-80">
            {currentImage && <AvatarImage src={currentImage} alt={userName ?? "Avatar"} />}
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {getInitials(userName ?? "?")}
            </AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ma photo de profil</DialogTitle>
        </DialogHeader>
        <ImagePicker onSelect={handleSelect} />
        {currentImage && (
          <div className="flex justify-end pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={mutation.isPending}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Supprimer la photo
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
