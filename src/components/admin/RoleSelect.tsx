"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { COMMITTEE_ROLE_LABELS } from "@/lib/schemas";
import type { CommitteeRole, UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  MEMBER: "Membre",
  COACH: "Coach",
  COMMITTEE: "Comité",
  ADMIN: "Admin",
};

interface RoleSelectProps {
  userId: string;
  currentRole: UserRole;
  currentCommitteeRole?: CommitteeRole | null;
  onRoleChange: (
    userId: string,
    role: UserRole,
    committeeRole?: CommitteeRole | null,
  ) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Role dropdown with inline confirmation before applying the change.
 * When COMMITTEE is selected, a secondary dropdown appears for the committee function.
 */
export function RoleSelect({
  userId,
  currentRole,
  currentCommitteeRole,
  onRoleChange,
  isLoading,
}: RoleSelectProps): React.ReactNode {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [selectedCommitteeRole, setSelectedCommitteeRole] = useState<
    CommitteeRole | null
  >(currentCommitteeRole ?? null);
  const [confirming, setConfirming] = useState(false);

  const hasChanged =
    selectedRole !== currentRole ||
    selectedCommitteeRole !== (currentCommitteeRole ?? null);

  function handleSelect(role: string): void {
    const r = role as UserRole;
    setSelectedRole(r);
    if (r !== "COMMITTEE") {
      setSelectedCommitteeRole(null);
    }
    setConfirming(
      r !== currentRole || selectedCommitteeRole !== (currentCommitteeRole ?? null),
    );
  }

  function handleCommitteeRoleSelect(value: string): void {
    const cr = value as CommitteeRole;
    setSelectedCommitteeRole(cr);
    setConfirming(true);
  }

  async function handleConfirm(): Promise<void> {
    await onRoleChange(
      userId,
      selectedRole,
      selectedRole === "COMMITTEE" ? selectedCommitteeRole : null,
    );
    setConfirming(false);
  }

  function handleCancel(): void {
    setSelectedRole(currentRole);
    setSelectedCommitteeRole(currentCommitteeRole ?? null);
    setConfirming(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Select value={selectedRole} onValueChange={handleSelect} disabled={isLoading}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {confirming && hasChanged && (
          <div className="flex gap-1">
            <Button size="sm" variant="default" onClick={handleConfirm} disabled={isLoading}>
              OK
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isLoading}>
              Annuler
            </Button>
          </div>
        )}
      </div>

      {selectedRole === "COMMITTEE" && (
        <Select
          value={selectedCommitteeRole ?? ""}
          onValueChange={handleCommitteeRoleSelect}
          disabled={isLoading}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Fonction…" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(COMMITTEE_ROLE_LABELS) as CommitteeRole[]).map((cr) => (
              <SelectItem key={cr} value={cr}>
                {COMMITTEE_ROLE_LABELS[cr]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
