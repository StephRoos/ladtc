import { redirect } from "next/navigation";

/**
 * Root /admin index — redirects to the admin dashboard so the URL
 * never lands on a 404 page.
 */
export default function AdminIndexPage(): never {
  redirect("/admin/dashboard");
}
