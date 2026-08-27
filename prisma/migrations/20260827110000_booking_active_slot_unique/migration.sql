-- A cancelled booking must not permanently block its time slot. Replace the
-- unconditional unique constraint with a partial unique index that only
-- covers active (PENDING/CONFIRMED) bookings.
DROP INDEX IF EXISTS "Booking_mentorId_scheduledAt_key";

CREATE UNIQUE INDEX "Booking_mentor_active_slot_key"
  ON "Booking" ("mentorId", "scheduledAt")
  WHERE "status" IN ('PENDING', 'CONFIRMED');
