import type { Metadata } from "next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { COMMITTEE_ROLE_LABELS } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import type { CommitteeRole } from "@/types";

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

interface TeamMemberData {
  id: string;
  name: string | null;
  role: string;
  committeeRole: CommitteeRole | null;
  image: string | null;
}

function TeamMemberCard({ member }: { member: TeamMemberData }): React.ReactNode {
  const displayRole =
    member.committeeRole
      ? COMMITTEE_ROLE_LABELS[member.committeeRole]
      : member.role === "COACH"
        ? "Coach"
        : "Comité";

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {getInitials(member.name ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-foreground">{member.name ?? "—"}</h3>
            <p className="text-sm font-medium text-primary">{displayRole}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent />
    </Card>
  );
}

/**
 * Team page — displays committee members and coaches from the database.
 */
export default async function TeamPage(): Promise<React.ReactNode> {
  const members = await prisma.user.findMany({
    where: { role: { in: ["COMMITTEE", "COACH"] } },
    select: {
      id: true,
      name: true,
      role: true,
      committeeRole: true,
      image: true,
    },
    orderBy: { name: "asc" },
  });

  const committeeMembers = members.filter((m) => m.role === "COMMITTEE");
  const coaches = members.filter((m) => m.role === "COACH");

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
        {committeeMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {committeeMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun membre du comité pour le moment.</p>
        )}
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
