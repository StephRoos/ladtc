import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

/**
 * Record an activity log entry in the database.
 * Fire-and-forget: errors are swallowed so logging never blocks the main flow.
 *
 * @param userId - ID of the user performing the action
 * @param action - Action identifier (e.g. "MEMBER_UPDATED", "ORDER_SHIPPED")
 * @param target - Entity type being acted upon (e.g. "member", "order")
 * @param targetId - ID of the target entity
 * @param changes - Optional JSON diff of what changed
 */
export async function logActivity(
  userId: string,
  action: string,
  target?: string,
  targetId?: string,
  changes?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        target: target ?? null,
        targetId: targetId ?? null,
        changes: changes
          ? (changes as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  } catch (err) {
    // Logging must never break the main flow
    console.error("[activity-log] Failed to write log entry:", err);
  }
}
