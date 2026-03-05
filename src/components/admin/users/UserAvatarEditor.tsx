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
import { useUpdateUserImage } from "@/hooks/use-users";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface UserAvatarEditorProps {
  userId: string;
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
 * Clickable avatar that opens a dialog to upload or remove a user's photo.
 */
export function UserAvatarEditor({
  userId,
  currentImage,
  userName,
}: UserAvatarEditorProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const mutation = useUpdateUserImage();

  async function handleSelect(url: string): Promise<void> {
    try {
      await mutation.mutateAsync({ id: userId, image: url });
      toast.success("Avatar mis à jour");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    }
  }

  async function handleRemove(): Promise<void> {
    try {
      await mutation.mutateAsync({ id: userId, image: null });
      toast.success("Avatar supprimé");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Avatar className="h-9 w-9 cursor-pointer transition-opacity hover:opacity-80">
            {currentImage && <AvatarImage src={currentImage} alt={userName ?? "Avatar"} />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {getInitials(userName ?? "?")}
            </AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Photo de {userName ?? "l'utilisateur"}</DialogTitle>
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
