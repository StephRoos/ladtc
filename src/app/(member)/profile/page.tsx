"use client";

import { useState } from "react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useMember } from "@/hooks/use-member";
import { MembershipCard } from "@/components/cards/MembershipCard";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Member profile page — displays user info, membership status, and edit form.
 * Requires authentication (redirects to /auth/login if not logged in).
 */
export default function ProfilePage(): React.ReactNode {
  const { isLoading: authLoading } = useRequireAuth();
  const { data, isLoading: memberLoading } = useMember();
  const [isEditing, setIsEditing] = useState(false);

  const isLoading = authLoading || memberLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-muted-foreground">
        Impossible de charger votre profil. Veuillez réessayer.
      </div>
    );
  }

  const { user, membership } = data;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      {/* User info card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>{user.name ?? "Membre LADTC"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <ProfileForm
              user={user}
              membership={membership}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm">
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
                <dd className="font-medium">
                  {membership?.emergencyContactPhone ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rôle</dt>
                <dd className="font-medium capitalize">{user.role.toLowerCase()}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Membership status card */}
      <MembershipCard membership={membership} />

      {/* Actions */}
      {membership?.status === "ACTIVE" && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="outline" disabled>
              Télécharger le certificat (bientôt disponible)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
