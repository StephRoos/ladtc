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
  onRoleChange: (userId: string, role: UserRole) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Role dropdown with inline confirmation before applying the change.
 */
export function RoleSelect({
  userId,
  currentRole,
  onRoleChange,
  isLoading,
}: RoleSelectProps): React.ReactNode {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [confirming, setConfirming] = useState(false);

  const hasChanged = selectedRole !== currentRole;

  function handleSelect(role: string): void {
    setSelectedRole(role as UserRole);
    setConfirming(role !== currentRole);
  }

  async function handleConfirm(): Promise<void> {
    await onRoleChange(userId, selectedRole);
    setConfirming(false);
  }

  function handleCancel(): void {
    setSelectedRole(currentRole);
    setConfirming(false);
  }

  return (
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
  );
}
