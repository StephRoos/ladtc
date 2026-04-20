import type { Metadata } from "next";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

/** Server-rendered at request time — requires database access. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Notre équipe | ${siteConfig.name}`,
  description:
    "Découvrez le comité de la dtc — club de trail running à Ellezelles.",
  openGraph: {
    title: `Notre équipe | ${siteConfig.name}`,
    description:
      "Découvrez le comité de la dtc — club de trail running à Ellezelles.",
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
  committeeRole: string | null;
  image: string | null;
}

function TeamMemberCard({ member }: { member: TeamMemberData }): React.ReactNode {
  const displayRole = member.committeeRole ?? "Comité";

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            {member.image && (
              <AvatarImage src={member.image} alt={member.name ?? "Avatar"} />
            )}
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
 * Team page — displays committee members from the database.
 */
export default async function TeamPage(): Promise<React.ReactNode> {
  const members = await prisma.user.findMany({
    where: { role: "COMMITTEE" },
    select: {
      id: true,
      name: true,
      role: true,
      committeeRole: true,
      image: true,
    },
    orderBy: { name: "asc" },
  });

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
      <section>
        <h2 className="mb-2 text-2xl font-bold">Le Comité</h2>
        <p className="mb-6 text-muted-foreground">
          Ils gèrent et représentent le club tout au long de l&apos;année.
        </p>
        {members.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun membre du comité pour le moment.</p>
        )}
      </section>
    </div>
  );
}
