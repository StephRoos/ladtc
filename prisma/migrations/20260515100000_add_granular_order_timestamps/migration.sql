-- Sprint 2c.1: granular timestamps for the grouped-orders workflow.
-- Each transition INTO a status writes its own timestamp. The legacy `shippedAt`
-- column is preserved for cases where a HOME_DELIVERY order is physically
-- shipped via post (distinct from the lot lifecycle).

ALTER TABLE "Order" ADD COLUMN "batchedAt"  TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "orderedAt"  TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "receivedAt" TIMESTAMP(3);
