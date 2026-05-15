-- Add batchId column to Order and replace OrderStatus enum values.
-- New workflow: PENDING -> BATCHED -> ORDERED -> RECEIVED -> DELIVERED (with CANCELLED).
-- Mapping for any existing rows: CONFIRMED -> BATCHED, SHIPPED -> ORDERED.

ALTER TABLE "Order" ADD COLUMN "batchId" TEXT;
CREATE INDEX "Order_batchId_idx" ON "Order"("batchId");

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'BATCHED', 'ORDERED', 'RECEIVED', 'DELIVERED', 'CANCELLED');

ALTER TABLE "Order"
  ALTER COLUMN "status" TYPE "OrderStatus"
  USING (
    CASE "status"::text
      WHEN 'CONFIRMED' THEN 'BATCHED'
      WHEN 'SHIPPED' THEN 'ORDERED'
      ELSE "status"::text
    END
  )::"OrderStatus";

ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
DROP TYPE "OrderStatus_old";
