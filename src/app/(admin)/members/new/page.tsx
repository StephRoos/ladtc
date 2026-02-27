"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateMember } from "@/hooks/use-members";
import { CreateMemberForm } from "@/components/admin/CreateMemberForm";
import type { MemberCreateFormData } from "@/lib/schemas";

/**
 * Admin page for creating a new member.
 */
export default function NewMemberPage(): React.ReactNode {
  const router = useRouter();
  const createMember = useCreateMember();

  async function handleSubmit(data: MemberCreateFormData): Promise<void> {
    await createMember.mutateAsync(data);
    router.push("/members");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/members"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        &larr; Retour aux membres
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        Nouveau membre
      </h1>
      <CreateMemberForm
        onSubmit={handleSubmit}
        isSubmitting={createMember.isPending}
        error={createMember.error?.message}
      />
    </div>
  );
}
