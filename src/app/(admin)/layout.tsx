import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { COMMITTEE_ROLES } from "@/lib/auth-guard";
import type { UserRole } from "@/types";
import { AdminNav } from "@/components/admin/AdminNav";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

/**
 * Admin layout — fetches session server-side, enforces role access, and
 * passes the correct flags to AdminNav. Any user whose role is not in
 * COMMITTEE_ROLES (COMMITTEE, ADMIN) is redirected to the dashboard.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactNode> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin/dashboard");
  }

  const role = session.user.role as UserRole | undefined;
  if (!role || !COMMITTEE_ROLES.includes(role)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AdminNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
