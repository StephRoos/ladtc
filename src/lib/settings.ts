import { prisma } from "@/lib/prisma";

/**
 * Admin-tunable key/value settings backed by the `Setting` table.
 * Values are JSON-encoded strings on the wire so a single column can hold
 * numbers, booleans, or structured payloads. Callers are responsible for
 * declaring the expected runtime type at the call site.
 *
 * Known keys (extend this list when adding new settings):
 *   - "equipment.shippingFee": number (in euros) — fee applied when
 *     deliveryMethod = HOME_DELIVERY on an equipment order.
 */

export const SETTING_KEYS = {
  EQUIPMENT_SHIPPING_FEE: "equipment.shippingFee",
} as const;

/** Default shipping fee in euros when the Setting row is missing. */
const DEFAULT_SHIPPING_FEE_EUR = 0;

/**
 * Reads the raw JSON-encoded value for a setting, returning null if absent.
 */
export async function getSettingRaw(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

/**
 * Reads a numeric setting. Falls back to the provided default when the
 * setting is absent or malformed.
 */
export async function getSettingNumber(key: string, fallback: number): Promise<number> {
  const raw = await getSettingRaw(key);
  if (raw === null) return fallback;
  const parsed = Number(JSON.parse(raw));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Reads the current shipping fee (in euros) for HOME_DELIVERY equipment orders.
 * Returns 0 if the setting is absent or unparseable — a missing fee never
 * inflates an order's total.
 */
export async function getEquipmentShippingFee(): Promise<number> {
  return getSettingNumber(SETTING_KEYS.EQUIPMENT_SHIPPING_FEE, DEFAULT_SHIPPING_FEE_EUR);
}

/**
 * Upserts a setting with a JSON-serialised value.
 */
export async function setSetting(key: string, value: number | string | boolean): Promise<void> {
  const encoded = JSON.stringify(value);
  await prisma.setting.upsert({
    where: { key },
    update: { value: encoded },
    create: { key, value: encoded },
  });
}
