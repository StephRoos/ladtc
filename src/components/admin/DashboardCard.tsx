import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "default" | "green" | "orange" | "red" | "blue";
}

const colorMap = {
  default: "text-foreground",
  green: "text-green-400",
  orange: "text-orange-400",
  red: "text-red-400",
  blue: "text-cyan-400",
};

const iconBgMap = {
  default: "bg-muted",
  green: "bg-green-500/10",
  orange: "bg-orange-500/10",
  red: "bg-red-500/10",
  blue: "bg-cyan-500/10",
};

/**
 * KPI card for the admin dashboard.
 * Shows an icon, a main value, a label, and an optional subtitle.
 */
export function DashboardCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = "default",
}: DashboardCardProps): React.ReactNode {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={cn("rounded-full p-2", iconBgMap[color])}>
          <Icon className={cn("h-4 w-4", colorMap[color])} />
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn("text-3xl font-bold", colorMap[color])}>{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
