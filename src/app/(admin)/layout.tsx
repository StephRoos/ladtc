import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

/**
 * Admin layout — fetches session server-side to pass correct role to AdminNav.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactNode> {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AdminNav isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
