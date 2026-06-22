"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadSponsorLogo } from "@/hooks/use-sponsors";
import type { Sponsor, SponsorFormData } from "@/types/sponsor";

// Form schema validation
const sponsorSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  tier: z.enum(["GOLD", "SILVER", "BRONZE"]),
  websiteUrl: z.string().url("URL invalide").or(z.literal("")),
  order: z.coerce.number().min(0, "L'ordre doit être positif").optional(),
  isActive: z.boolean().optional(),
});

type SponsorFormValues = z.infer<typeof sponsorSchema>;

interface SponsorFormProps {
  sponsor?: Sponsor | null;
  onSubmit: (data: SponsorFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * SponsorForm component - form for creating/editing sponsors.
 * Features:
 * - Form validation with Zod
 * - Logo upload with preview
 * - All sponsor fields (name, tier, websiteUrl, order, isActive)
 * - Loading state
 */
export function SponsorForm({
  sponsor,
  onSubmit,
  onCancel,
  isLoading = false,
}: SponsorFormProps): React.ReactNode {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const uploadLogoMutation = useUploadSponsorLogo();

  // Initialize form with sponsor data or defaults
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: sponsor?.name || "",
      tier: sponsor?.tier || "BRONZE",
      websiteUrl: sponsor?.websiteUrl || "",
      order: sponsor?.order || 0,
      isActive: sponsor?.isActive ?? true,
    },
  });

  // Set logo preview from existing sponsor
  useEffect(() => {
    if (sponsor?.logoUrl) {
      setLogoPreview(sponsor.logoUrl);
    }
  }, [sponsor?.logoUrl]);

  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setUploadProgress("Type de fichier non autorisé");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadProgress("Le fichier dépasse 5 Mo");
      return;
    }

    setLogoFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setUploadProgress("");

    // Cleanup preview URL on unmount
    return () => URL.revokeObjectURL(previewUrl);
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
  };

  // Handle form submission
  const handleFormSubmit = handleSubmit(async (formData) => {
    let logoUrl = sponsor?.logoUrl || null;

    // Upload logo if a new file is selected
    if (logoFile) {
      setUploadProgress("Téléchargement en cours...");
      try {
        const result = await uploadLogoMutation.mutateAsync(logoFile);
        logoUrl = result.url;
        setUploadProgress("");
      } catch (error) {
        setUploadProgress("Erreur lors du téléchargement");
        return;
      }
    }

    // Call onSubmit with form data + logo URL
    const submitData: SponsorFormData = {
      name: formData.name,
      tier: formData.tier,
      ...(formData.websiteUrl && { websiteUrl: formData.websiteUrl }),
      order: formData.order,
      isActive: formData.isActive,
      logoUrl,
    };
    onSubmit(submitData);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nom du sponsor *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Ex: Décathlon"
          disabled={isLoading || isSubmitting}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Tier */}
      <div className="space-y-2">
        <Label htmlFor="tier">Niveau</Label>
        <Select
          value={watch("tier")}
          onValueChange={(value) => setValue("tier", value as "GOLD" | "SILVER" | "BRONZE")}
          disabled={isLoading || isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GOLD">Or (Gold)</SelectItem>
            <SelectItem value="SILVER">Argent (Silver)</SelectItem>
            <SelectItem value="BRONZE">Bronze</SelectItem>
          </SelectContent>
        </Select>
        {errors.tier && (
          <p className="text-sm text-destructive">{errors.tier.message}</p>
        )}
      </div>

      {/* Website URL */}
      <div className="space-y-2">
        <Label htmlFor="websiteUrl">URL du site web</Label>
        <Input
          id="websiteUrl"
          {...register("websiteUrl")}
          placeholder="https://exemple.com"
          disabled={isLoading || isSubmitting}
          type="url"
          aria-invalid={!!errors.websiteUrl}
        />
        {errors.websiteUrl && (
          <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
        )}
      </div>

      {/* Order */}
      <div className="space-y-2">
        <Label htmlFor="order">Ordre (pour le tri)</Label>
        <Input
          id="order"
          {...register("order", { valueAsNumber: true })}
          type="number"
          min="0"
          placeholder="0"
          disabled={isLoading || isSubmitting}
          aria-invalid={!!errors.order}
        />
        {errors.order && (
          <p className="text-sm text-destructive">{errors.order.message}</p>
        )}
      </div>

      {/* Is Active */}
      <div className="flex items-center space-x-2">
        <Input
          id="isActive"
          type="checkbox"
          checked={watch("isActive")}
          onChange={(e) => setValue("isActive", e.target.checked)}
          disabled={isLoading || isSubmitting}
          className="h-4 w-4"
        />
        <Label htmlFor="isActive">Sponsor actif</Label>
      </div>

      {/* Logo Upload */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Logo</Label>
          <p className="text-sm text-muted-foreground">
            Formats acceptés : JPG, PNG, WebP, GIF (max 5 Mo)
          </p>
        </div>

        {/* Logo preview */}
        {logoPreview && (
          <div className="relative">
            <div className="relative h-32 w-48 overflow-hidden rounded-lg border border-border">
              <Image
                src={logoPreview}
                alt="Prévisualisation du logo"
                fill
                className="object-contain"
                sizes="192px"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={isLoading || isSubmitting}
              className="mt-2"
            >
              Supprimer le logo
            </Button>
          </div>
        )}

        {/* Upload button */}
        {!logoPreview && (
          <Input
            id="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleLogoChange}
            disabled={isLoading || isSubmitting}
          />
        )}

        {/* Upload progress/error */}
        {uploadProgress && (
          <p
            className={`text-sm ${uploadProgress.includes("Erreur") ? "text-destructive" : "text-muted-foreground"}`}
          >
            {uploadProgress}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isLoading || isSubmitting || uploadLogoMutation.isPending}
          className="min-w-[120px]"
        >
          {isSubmitting || uploadLogoMutation.isPending ? "En cours..." : "Enregistrer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
