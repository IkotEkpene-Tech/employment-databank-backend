-- V26__add_submitted_at_to_applicants.sql
--
-- Records exactly when an application was submitted, independent of
-- "updatedAt" (which can move later for unrelated reasons, e.g. a password
-- reset). Powers GET /applicants/application's submittedAt field.

ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMPTZ;
