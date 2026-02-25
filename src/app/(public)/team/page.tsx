import type { Metadata } from "next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { committeeMembers, coaches } from "@/config/team";
import type { TeamMember } from "@/types";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Notre équipe | ${siteConfig.name}`,
  description:
    "Découvrez le comité et les coachs de la dtc — club de trail running à Ellezelles.",
  openGraph: {
    title: `Notre équipe | ${siteConfig.name}`,
    description:
      "Découvrez le comité et les coachs de la dtc — club de trail running à Ellezelles.",
    url: `${siteConfig.url}/team`,
    siteName: siteConfig.fullName,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.fullName,
      },
    ],
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface TeamMemberCardProps {
  member: TeamMember;
}

function TeamMemberCard({ member }: TeamMemberCardProps): React.ReactNode {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-foreground">{member.name}</h3>
            <p className="text-sm font-medium text-primary">{member.role}</p>
            {member.specialty && (
              <p className="text-xs text-muted-foreground">{member.specialty}</p>
            )}
          </div>
        </div>
      </CardHeader>
      {(member.bio || member.email) && (
        <CardContent>
          {member.bio && (
            <p className="text-sm text-muted-foreground">{member.bio}</p>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="mt-3 block text-xs text-accent hover:underline"
            >
              {member.email}
            </a>
          )}
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Team page — displays committee members and coaches in a responsive grid
 */
export default function TeamPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Page header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Notre équipe</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          la dtc est animé par des bénévoles passionnés. Découvrez les personnes
          qui font vivre notre club au quotidien.
        </p>
      </div>

      {/* Committee section */}
      <section className="mb-14">
        <h2 className="mb-2 text-2xl font-bold">Le Comité</h2>
        <p className="mb-6 text-muted-foreground">
          Ils gèrent et représentent le club tout au long de l&apos;année.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {committeeMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      {/* Coaches section — only shown if there are coaches */}
      {coaches.length > 0 && (
        <section>
          <h2 className="mb-2 text-2xl font-bold">Les Coachs</h2>
          <p className="mb-6 text-muted-foreground">
            Ils vous accompagnent dans votre progression et animent les
            entraînements.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
