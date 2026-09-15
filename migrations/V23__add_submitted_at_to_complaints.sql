-- V23__add_submitted_at_to_complaints.sql
--
-- Stores the client-reported submission timestamp from the complaints form,
-- separate from the server-side "createdAt".

ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP;
