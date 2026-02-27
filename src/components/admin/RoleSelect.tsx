"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COMMITTEE_ROLE_SUGGESTIONS } from "@/lib/schemas";
import type { UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  MEMBER: "Membre",
  COACH: "Coach",
  COMMITTEE: "Comité",
  ADMIN: "Admin",
};

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
 * When COMMITTEE is selected, a free-text input with suggestions appears
 * for the committee function.
 */
export function RoleSelect({
  userId,
  currentRole,
  currentCommitteeRole,
  onRoleChange,
  isLoading,
}: RoleSelectProps): React.ReactNode {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [committeeRoleInput, setCommitteeRoleInput] = useState(
    currentCommitteeRole ?? "",
  );
  const [confirming, setConfirming] = useState(false);

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

  const datalistId = `committee-roles-${userId}`;

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
        <>
          <Input
            list={datalistId}
            value={committeeRoleInput}
            onChange={(e) => {
              setCommitteeRoleInput(e.target.value);
              setConfirming(true);
            }}
            placeholder="Fonction (ex: Président, Trésorier…)"
            className="w-56"
            disabled={isLoading}
          />
          <datalist id={datalistId}>
            {COMMITTEE_ROLE_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </>
      )}
    </div>
  );
}
