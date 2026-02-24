"use client";

import Link from "next/link";
import {
  Users,
  UserCheck,
  ShoppingCart,
  Clock,
  Package,
  Settings,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { useOrders } from "@/hooks/use-orders";
import { useUpdateOrder } from "@/hooks/use-orders";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { QuickActions } from "@/components/admin/QuickActions";
import { ActivityLogTable } from "@/components/admin/ActivityLogTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types";

const quickActions = [
  {
    href: "/admin/orders?status=PENDING",
    label: "Voir les commandes en attente",
    description: "Traiter et expédier les commandes reçues",
    icon: ShoppingCart,
    color: "orange" as const,
  },
  {
    href: "/members",
    label: "Gérer les membres",
    description: "Consulter, modifier et gérer les adhésions",
    icon: Users,
    color: "blue" as const,
  },
  {
    href: "/admin/products",
    label: "Gérer les produits",
    description: "Catalogue, stock et tarifs",
    icon: Package,
    color: "green" as const,
  },
];

/**
 * Admin dashboard main page — KPIs, quick actions, recent activity and pending orders.
 */
export default function AdminDashboardPage(): React.ReactNode {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: logsData, isLoading: logsLoading } = useActivityLogs({ take: 5 });
  const { data: ordersData, isLoading: ordersLoading } = useOrders({
    status: "PENDING",
    page: 1,
  });
  const updateOrder = useUpdateOrder();

  const firstName = user?.name?.split(" ")[0] ?? "vous";

  async function handleMarkShipped(order: Order): Promise<void> {
    await updateOrder.mutateAsync({
      id: order.id,
      data: { status: "SHIPPED" },
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold">
          Bonjour, <span className="text-primary">{firstName}</span> !
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Voici un aperçu de l&apos;activité du club.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))
        ) : (
          <>
            <DashboardCard
              label="Total membres"
              value={stats?.totalMembers ?? 0}
              subtitle={`${stats?.recentRegistrations ?? 0} nouveaux cette semaine`}
              icon={Users}
              color="default"
            />
            <DashboardCard
              label="Membres actifs"
              value={stats?.activeMembers ?? 0}
              icon={UserCheck}
              color="green"
            />
            <DashboardCard
              label="Commandes en attente"
              value={stats?.pendingOrders ?? 0}
              subtitle="à traiter"
              icon={ShoppingCart}
              color="orange"
            />
            <DashboardCard
              label="Renouvellements (30j)"
              value={stats?.pendingRenewals ?? 0}
              subtitle="arrivant à échéance"
              icon={Clock}
              color="red"
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Accès rapides</h2>
        <QuickActions actions={quickActions} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Activité récente
            </CardTitle>
            <Link
              href="/admin/activity-logs"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            <ActivityLogTable
              logs={logsData?.logs ?? []}
              isLoading={logsLoading}
            />
          </CardContent>
        </Card>

        {/* Pending orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Commandes en attente
            </CardTitle>
            <Link
              href="/admin/orders"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (ordersData?.orders.length ?? 0) === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucune commande en attente
              </p>
            ) : (
              <div className="space-y-2">
                {ordersData?.orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{order.shippingName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.total.toFixed(2)} EUR —{" "}
                        {order.items.length} article{order.items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        En attente
                      </Badge>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleMarkShipped(order)}
                        disabled={updateOrder.isPending}
                      >
                        Expédier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin-only shortcuts */}
      {user && "role" in user && user.role === "ADMIN" && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Administration</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/users">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Gestion des rôles
              </Button>
            </Link>
            <Link href="/admin/statistics">
              <Button variant="outline" size="sm" className="gap-2">
                <Activity className="h-4 w-4" />
                Statistiques détaillées
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
