import { redirect } from "next/navigation";

/**
 * Product detail pages are no longer used — equipment orders go through the
 * Bioracer store. Redirect any legacy URL to the main equipment page.
 */
export default function ProductDetailPage(): never {
  redirect("/equipment");
}
