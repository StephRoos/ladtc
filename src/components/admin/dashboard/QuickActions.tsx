import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickActionItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color?: "orange" | "blue" | "green" | "red";
}

interface QuickActionsProps {
  actions: QuickActionItem[];
}

const colorMap = {
  orange: "text-orange-400 bg-orange-500/10",
  blue: "text-cyan-400 bg-cyan-500/10",
  green: "text-green-400 bg-green-500/10",
  red: "text-red-400 bg-red-500/10",
};

/**
 * Grid of quick action cards linking to admin pages.
 */
export function QuickActions({ actions }: QuickActionsProps): React.ReactNode {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        const classes = colorMap[action.color ?? "orange"];
        return (
          <Link key={action.href} href={action.href}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
              <CardContent className="flex items-start gap-4 p-5">
                <div className={cn("rounded-lg p-2 shrink-0", classes)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
