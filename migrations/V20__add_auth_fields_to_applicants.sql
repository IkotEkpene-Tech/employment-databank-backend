-- V20__add_auth_fields_to_applicants.sql
--
-- Extends the applicants table into the auth/User identity for the new
-- pay -> verify NIN -> access code -> password registration flow.
--
-- NOTE on the unique index on email below: if this fails with a
-- "duplicate key value violates unique constraint" error, it means two or
-- more existing applicant rows already share a non-null email address.
-- Those must be resolved by hand (the migration must not silently delete
-- or overwrite real applicant data) before re-running this migration.

ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS "fullName" TEXT,
  ADD COLUMN IF NOT EXISTS "registrationStatus" TEXT NOT NULL DEFAULT 'payment_pending',
  ADD COLUMN IF NOT EXISTS "applicationStatus" TEXT NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS "paymentReference" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationFailureReason" TEXT,
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT,
  ADD COLUMN IF NOT EXISTS "accessCodeHash" TEXT,
  ADD COLUMN IF NOT EXISTS "accessCodeExpiresAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "accessCodeUsed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "resubmitNinTokenHash" TEXT,
  ADD COLUMN IF NOT EXISTS "resubmitNinTokenExpiresAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "passwordResetTokenHash" TEXT,
  ADD COLUMN IF NOT EXISTS "passwordResetTokenExpiresAt" TIMESTAMP;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'applicants_registrationstatus_check'
  ) THEN
    ALTER TABLE applicants
      ADD CONSTRAINT applicants_registrationstatus_check
      CHECK ("registrationStatus" IN (
        'payment_pending',
        'payment_confirmed',
        'nin_verified',
        'verification_failed',
        'code_issued',
        'active'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'applicants_applicationstatus_check'
  ) THEN
    ALTER TABLE applicants
      ADD CONSTRAINT applicants_applicationstatus_check
      CHECK ("applicationStatus" IN ('not_started', 'in_progress', 'submitted'));
  END IF;
END
$$;

-- firstName/surname are now only known after NIN verification succeeds,
-- so they can no longer be required at insert time.
ALTER TABLE applicants ALTER COLUMN "firstName" DROP NOT NULL;
ALTER TABLE applicants ALTER COLUMN "surname" DROP NOT NULL;

-- Email becomes the login identifier, so it must be unique. Postgres unique
-- indexes allow any number of NULLs, so this is safe against historic rows
-- with no email on file.
CREATE UNIQUE INDEX IF NOT EXISTS idx_applicants_email_unique
  ON applicants (email)
  WHERE email IS NOT NULL;
