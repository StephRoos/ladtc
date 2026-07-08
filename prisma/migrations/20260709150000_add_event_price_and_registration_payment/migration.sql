-- Add optional price to events (for paid registrations like UTC 4)
ALTER TABLE "Event" ADD COLUMN "price" DOUBLE PRECISION;

-- Add payment tracking to event registrations
ALTER TABLE "EventRegistration" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "EventRegistration" ADD COLUMN "stripeSessionId" TEXT;

-- Ensure each Stripe session is linked to at most one registration
CREATE UNIQUE INDEX "EventRegistration_stripeSessionId_key" ON "EventRegistration"("stripeSessionId");

-- Add updatedAt column if missing (prisma may already add it via schema)
ALTER TABLE "EventRegistration" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
