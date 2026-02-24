"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ORANGE = "#FF8C00";
const CYAN = "#0891B2";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";

// ─── Pie chart: member status breakdown ──────────────────────────────────────

interface MemberBreakdown {
  ACTIVE: number;
  PENDING: number;
  INACTIVE: number;
  EXPIRED: number;
}

interface MemberPieChartProps {
  data: MemberBreakdown;
}

const PIE_COLORS = [GREEN, AMBER, "#6b7280", RED];

/**
 * Pie chart showing member count by status.
 */
export function MemberPieChart({ data }: MemberPieChartProps): React.ReactNode {
  const chartData = [
    { name: "Actifs", value: data.ACTIVE },
    { name: "En attente", value: data.PENDING },
    { name: "Inactifs", value: data.INACTIVE },
    { name: "Expirés", value: data.EXPIRED },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Line chart: member registration trend ───────────────────────────────────

interface TrendDataPoint {
  month: string;
  count: number;
}

interface MemberTrendChartProps {
  data: TrendDataPoint[];
}

/**
 * Line chart showing member registrations per month.
 */
export function MemberTrendChart({ data }: MemberTrendChartProps): React.ReactNode {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke={ORANGE}
          strokeWidth={2}
          dot={{ fill: ORANGE, r: 3 }}
          name="Inscriptions"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Bar chart: orders per month ─────────────────────────────────────────────

interface OrderTrendChartProps {
  data: TrendDataPoint[];
}

/**
 * Bar chart showing order count per month.
 */
export function OrderTrendChart({ data }: OrderTrendChartProps): React.ReactNode {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
        />
        <Bar dataKey="count" fill={CYAN} radius={[4, 4, 0, 0]} name="Commandes" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Bar chart: top products ─────────────────────────────────────────────────

interface TopProductsChartProps {
  data: Array<{ name: string; salesCount: number }>;
}

/**
 * Horizontal bar chart showing top 5 products by sales count.
 */
export function TopProductsChart({ data }: TopProductsChartProps): React.ReactNode {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
        />
        <Bar dataKey="salesCount" fill={ORANGE} radius={[0, 4, 4, 0]} name="Ventes" />
      </BarChart>
    </ResponsiveContainer>
  );
}
