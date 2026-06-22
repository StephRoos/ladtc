import { redirect } from "next/navigation";

/**
 * Redirection from /sponsors to homepage
 * Sponsors are now displayed in a carousel on the homepage and UTC4 page
 */
export default function SponsorsPage(): never {
  redirect("/");
}
