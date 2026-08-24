"use client";

import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  Settings,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { DashboardCard } from "@/components/admin/dashboard/DashboardCard";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { ActivityLogTable } from "@/components/admin/dashboard/ActivityLogTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    href: "/members",
    label: "Gérer les membres",
    description: "Consulter, modifier et gérer les adhésions",
    icon: Users,
    color: "blue" as const,
  },
];

/**
 * Admin dashboard main page — KPIs, quick actions, recent activity and pending orders.
 */
export default function AdminDashboardPage(): React.ReactNode {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: logsData, isLoading: logsLoading } = useActivityLogs({ take: 5 });

  const firstName = user?.name?.split(" ")[0] ?? "vous";

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
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
              label="Cotisations impayées"
              value={stats?.unpaidCurrentSeason ?? 0}
              subtitle="saison en cours"
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

        {/* Cotisations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Cotisations
            </CardTitle>
            <Link
              href="/members"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Gérer
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Membres actifs</p>
                  <p className="text-xs text-muted-foreground">saison en cours</p>
                </div>
                <span className="text-2xl font-bold text-green-500">
                  {stats?.activeMembers ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Cotisations impayées</p>
                  <p className="text-xs text-muted-foreground">à relancer</p>
                </div>
                <span className="text-2xl font-bold text-red-500">
                  {stats?.unpaidCurrentSeason ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Committee shortcuts */}
      {user &&
        "role" in user &&
        (user.role === "COMMITTEE" || user.role === "ADMIN") && (
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
