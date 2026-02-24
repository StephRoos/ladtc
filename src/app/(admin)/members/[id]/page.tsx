"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { MemberForm } from "@/components/admin/MemberForm";
import { MembershipCard } from "@/components/cards/MembershipCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, Membership } from "@/types";

interface MemberDetailResponse {
  user: User;
  membership: Membership | null;
}

async function fetchMemberById(id: string): Promise<MemberDetailResponse> {
  const res = await fetch(`/api/members/${id}`);
  if (!res.ok) {
    throw new Error("Membre introuvable");
  }
  return res.json() as Promise<MemberDetailResponse>;
}

interface AdminMemberDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Admin member detail page — view and edit a member's full profile and membership.
 * Requires COMMITTEE or ADMIN role.
 */
export default function AdminMemberDetailPage({
  params,
}: AdminMemberDetailPageProps): React.ReactNode {
  useRequireAuth();

  const { id } = use(params);
  const [isEditing, setIsEditing] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  const { data, isLoading } = useQuery<MemberDetailResponse>({
    queryKey: ["member", id],
    queryFn: () => fetchMemberById(id),
    staleTime: 2 * 60 * 1000,
  });

  async function handleSendReminder(): Promise<void> {
    try {
      const res = await fetch(`/api/members/${id}/send-reminder`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        alert(err.error ?? "Erreur lors de l'envoi du rappel");
        return;
      }
      setReminderSent(true);
    } catch {
      alert("Erreur lors de l'envoi du rappel");
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-muted-foreground">Membre introuvable.</p>
        <Link href="/admin/members" className="mt-4 inline-block text-sm text-primary hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const { user, membership } = data;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/members">← Retour</Link>
        </Button>
        <h1 className="text-2xl font-bold">{user.name ?? user.email}</h1>
      </div>

      {/* User info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Nom</dt>
              <dd className="font-medium">{user.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rôle</dt>
              <dd className="font-medium capitalize">{user.role.toLowerCase()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Téléphone</dt>
              <dd className="font-medium">{membership?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Contact d&apos;urgence</dt>
              <dd className="font-medium">{membership?.emergencyContact ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tél. urgence</dt>
              <dd className="font-medium">{membership?.emergencyContactPhone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Inscrit le</dt>
              <dd className="font-medium">
                {new Date(user.createdAt).toLocaleDateString("fr-BE")}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Membership status */}
      <MembershipCard membership={membership} />

      {/* Edit membership form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Gérer la cotisation</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <MemberForm
              memberId={user.id}
              membership={membership}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-3">
              {membership?.notes && (
                <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                  <span className="font-medium">Notes : </span>
                  {membership.notes}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSendReminder}
                  disabled={reminderSent}
                >
                  {reminderSent ? "Rappel envoyé" : "Envoyer un rappel"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
