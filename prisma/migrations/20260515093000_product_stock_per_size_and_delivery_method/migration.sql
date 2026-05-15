-- Sprint 2a Issue #16:
-- 1. Stock per size: dedicated ProductStock table. Drop Product.stock.
-- 2. Delivery method: enum + Order.deliveryMethod, shipping* fields become nullable
--    (CLUB_PICKUP orders don't need an address).

-- ─── Delivery method ──────────────────────────────────────────────────────────

CREATE TYPE "DeliveryMethod" AS ENUM ('HOME_DELIVERY', 'CLUB_PICKUP');

ALTER TABLE "Order"
  ADD COLUMN "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'HOME_DELIVERY';

ALTER TABLE "Order" ALTER COLUMN "shippingName"    DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "shippingEmail"   DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "shippingPhone"   DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "shippingAddress" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "shippingCity"    DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "shippingZip"     DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "shippingCountry" DROP NOT NULL;

-- ─── Stock per size ───────────────────────────────────────────────────────────

CREATE TABLE "ProductStock" (
  "id"        TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "size"      TEXT NOT NULL,
  "quantity"  INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "ProductStock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductStock_productId_size_key" ON "ProductStock"("productId", "size");
CREATE INDEX "ProductStock_productId_idx" ON "ProductStock"("productId");

ALTER TABLE "ProductStock"
  ADD CONSTRAINT "ProductStock_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed ProductStock from existing Product.sizes: one row per (productId, size)
-- with quantity = 0. Admin reconfigures via the new per-size stock UI.
-- The old Product.stock (single global integer) cannot be safely split across
-- sizes — sets quantity to 0 and lets the admin decide.
INSERT INTO "ProductStock" ("id", "productId", "size", "quantity")
SELECT
  'pstk_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
  p.id,
  s.size,
  0
FROM "Product" p
CROSS JOIN LATERAL unnest(p.sizes) AS s(size);

-- Drop the legacy global stock column
ALTER TABLE "Product" DROP COLUMN "stock";
