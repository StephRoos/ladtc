"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContributionUrl } from "@/hooks/use-contribution-url";

/**
 * Public "share your photos & videos" button. Opens the committee-configured
 * Nextcloud file-drop link (write-only, no account, handles large files) in a
 * new tab. Renders nothing until a link is configured in Admin → Paramètres.
 */
export function ContributeButton(): React.ReactNode {
  const { data: url } = useContributionUrl();
  if (!url) return null;

  return (
    <Button asChild variant="outline">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Upload className="mr-2 h-4 w-4" />
        Partager vos photos &amp; vidéos
      </a>
    </Button>
  );
}
