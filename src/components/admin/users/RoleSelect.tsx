"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCommitteeRoles } from "@/hooks/use-committee-roles";
import type { UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  MEMBER: "Membre",
  COMMITTEE: "Comité",
  ADMIN: "Admin", // legacy value, kept for display of any pre-existing account
};

// Roles a committee member can assign. ADMIN is deprecated and not selectable.
const SELECTABLE_ROLES: UserRole[] = ["MEMBER", "COMMITTEE"];

interface RoleSelectProps {
  userId: string;
  currentRole: UserRole;
  currentCommitteeRole?: string | null;
  onRoleChange: (
    userId: string,
    role: UserRole,
    committeeRole?: string | null,
  ) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Role dropdown with inline confirmation before applying the change.
 * When COMMITTEE is selected, a second dropdown appears to pick the
 * committee function (Président, Trésorier, …) from the admin-tunable list
 * stored under the `committee.roles` setting.
 */
export function RoleSelect({
  userId,
  currentRole,
  currentCommitteeRole,
  onRoleChange,
  isLoading,
}: RoleSelectProps): React.ReactNode {
  const { data: committeeRoles } = useCommitteeRoles();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [committeeRoleInput, setCommitteeRoleInput] = useState(
    currentCommitteeRole ?? "",
  );
  const [confirming, setConfirming] = useState(false);

  // Sync local state when props change (e.g. after another admin's mutation)
  /* eslint-disable react-hooks/set-state-in-effect -- intentional prop sync */
  useEffect(() => {
    setSelectedRole(currentRole);
    setCommitteeRoleInput(currentCommitteeRole ?? "");
    setConfirming(false);
  }, [currentRole, currentCommitteeRole]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const hasChanged =
    selectedRole !== currentRole ||
    committeeRoleInput !== (currentCommitteeRole ?? "");

  function handleSelect(role: string): void {
    const r = role as UserRole;
    setSelectedRole(r);
    if (r !== "COMMITTEE") {
      setCommitteeRoleInput("");
    }
    setConfirming(true);
  }

  async function handleConfirm(): Promise<void> {
    const cr =
      selectedRole === "COMMITTEE" && committeeRoleInput.trim()
        ? committeeRoleInput.trim()
        : null;
    await onRoleChange(userId, selectedRole, cr);
    setConfirming(false);
  }

  function handleCancel(): void {
    setSelectedRole(currentRole);
    setCommitteeRoleInput(currentCommitteeRole ?? "");
    setConfirming(false);
  }

  // Build the list of options shown in the committee function dropdown:
  // the configured list, plus the current value if it's not already in it
  // (so a user whose function was removed from the list is still displayed
  // correctly and can be kept or changed).
  const options = committeeRoles ?? [];
  const optionsWithCurrent =
    currentCommitteeRole && !options.includes(currentCommitteeRole)
      ? [currentCommitteeRole, ...options]
      : options;
  const noneValue = "__none__";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Select value={selectedRole} onValueChange={handleSelect} disabled={isLoading}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SELECTABLE_ROLES.map((role) => (
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
          value={committeeRoleInput || noneValue}
          onValueChange={(value) => {
            setCommitteeRoleInput(value === noneValue ? "" : value);
            setConfirming(true);
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Fonction (optionnelle)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={noneValue}>— Aucune fonction —</SelectItem>
            {optionsWithCurrent.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
