-- Sprint 2b Issue #16:
-- 1. Default delivery method becomes CLUB_PICKUP (most common case for the club).
-- 2. Settings table for admin-tunable values (shipping fee starts here).

ALTER TABLE "Order" ALTER COLUMN "deliveryMethod" SET DEFAULT 'CLUB_PICKUP';

CREATE TABLE "Setting" (
  "key"       TEXT NOT NULL,
  "value"     TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- Seed default: shipping fee for HOME_DELIVERY equipment orders.
-- Value is JSON-encoded (lib/settings.ts parses on read).
INSERT INTO "Setting" ("key", "value", "updatedAt")
VALUES ('equipment.shippingFee', '5.00', NOW());
