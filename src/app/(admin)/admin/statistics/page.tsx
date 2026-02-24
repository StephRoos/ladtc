"use client";

import { useStatistics } from "@/hooks/use-statistics";
import {
  MemberPieChart,
  MemberTrendChart,
  OrderTrendChart,
  TopProductsChart,
} from "@/components/admin/StatisticsCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Admin statistics page — member breakdown, trends, and product stats.
 */
export default function AdminStatisticsPage(): React.ReactNode {
  const { data, isLoading, isError } = useStatistics();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-destructive">
          Impossible de charger les statistiques. Veuillez réessayer.
        </p>
      </div>
    );
  }

  const totalMembers =
    data.memberBreakdown.ACTIVE +
    data.memberBreakdown.PENDING +
    data.memberBreakdown.INACTIVE +
    data.memberBreakdown.EXPIRED;

  const avgOrderValue =
    data.totalOrders > 0
      ? (data.totalRevenue / data.totalOrders).toFixed(2)
      : "0.00";

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <h1 className="text-2xl font-bold">Statistiques</h1>

      {/* Member statistics */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Membres</h2>

        {/* Summary counts */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total", value: totalMembers, color: "text-foreground" },
            { label: "Actifs", value: data.memberBreakdown.ACTIVE, color: "text-green-400" },
            { label: "En attente", value: data.memberBreakdown.PENDING, color: "text-amber-400" },
            { label: "Expirés", value: data.memberBreakdown.EXPIRED, color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Répartition par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <MemberPieChart data={data.memberBreakdown} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Inscriptions — 12 derniers mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MemberTrendChart data={data.memberTrend} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Order statistics */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Commandes</h2>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Total commandes", value: data.totalOrders },
            { label: "Chiffre d'affaires", value: `${data.totalRevenue.toFixed(2)} EUR` },
            { label: "Valeur moyenne", value: `${avgOrderValue} EUR` },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Commandes par mois — 12 derniers mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTrendChart data={data.orderTrend} />
          </CardContent>
        </Card>
      </section>

      {/* Product statistics */}
      {data.topProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Produits</h2>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top 5 produits par ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <TopProductsChart data={data.topProducts} />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
