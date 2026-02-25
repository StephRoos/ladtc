import { AdminNav } from "@/components/admin/AdminNav";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

/**
 * Admin layout — auth is handled by middleware.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AdminNav isAdmin={true} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
