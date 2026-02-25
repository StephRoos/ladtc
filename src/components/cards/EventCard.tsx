import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarDays, MapPin, Users, FileText } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    date: string;
    location: string;
    type: "TRAINING" | "RACE" | "CAMP" | "SOCIAL";
    difficulty: string | null;
    maxParticipants: number | null;
    _count: { registrations: number };
    source?: "event" | "blog-event";
    slug?: string;
    featuredImageUrl?: string | null;
  };
}

const TYPE_LABELS: Record<string, string> = {
  TRAINING: "Entraînement",
  RACE: "Course",
  CAMP: "Stage",
  SOCIAL: "Social",
};

const TYPE_COLORS: Record<string, string> = {
  TRAINING: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
  RACE: "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20",
  CAMP: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
  SOCIAL: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
};

/**
 * Event card component — displays date, location, type badge and available spots.
 * Supports both real events (links to /events/:id) and blog-events (links to /blog/:slug).
 */
export function EventCard({ event }: EventCardProps): React.ReactNode {
  const isBlogEvent = event.source === "blog-event";
  const href =
    isBlogEvent && event.slug ? `/blog/${event.slug}` : `/events/${event.id}`;

  const eventDate = new Date(event.date);
  const day = eventDate.toLocaleDateString("fr-FR", { day: "numeric" });
  const month = eventDate.toLocaleDateString("fr-FR", { month: "short" });
  const time = eventDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - event._count.registrations
    : null;

  return (
    <Link href={href} className="group block">
      <Card className="h-full overflow-hidden border-border bg-card transition-all duration-200 group-hover:border-primary/40">
        <CardHeader className="flex flex-row items-start gap-4 pb-2">
          {/* Date block */}
          <div className="flex shrink-0 flex-col items-center rounded-lg bg-primary/10 px-3 py-2 text-center">
            <span className="text-2xl font-bold leading-none text-primary">
              {day}
            </span>
            <span className="text-xs font-medium uppercase text-primary/80">
              {month}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={`w-fit text-xs ${TYPE_COLORS[event.type] ?? ""}`}
              >
                {TYPE_LABELS[event.type] ?? event.type}
              </Badge>
              {event.difficulty && (
                <Badge variant="outline" className="text-xs">
                  {event.difficulty}
                </Badge>
              )}
              {isBlogEvent && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <FileText className="h-3 w-3" />
                  Article
                </Badge>
              )}
            </div>
            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
              {event.title}
            </h3>
          </div>
        </CardHeader>

        <CardContent>
          {event.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {time}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </span>
            )}
            {!isBlogEvent && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {event._count.registrations} inscrit
                {event._count.registrations !== 1 ? "s" : ""}
                {spotsLeft !== null && (
                  <span
                    className={
                      spotsLeft <= 3
                        ? "font-medium text-orange-400"
                        : ""
                    }
                  >
                    {" "}
                    ({spotsLeft} place{spotsLeft !== 1 ? "s" : ""} restante
                    {spotsLeft !== 1 ? "s" : ""})
                  </span>
                )}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
