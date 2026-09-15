-- V24__account_and_employment_access_split.sql
--
-- Reworks the registration flow: accounts are now created with just
-- email/password/phone and verified by email OTP; NIN + a paid, reusable
-- access code are only needed later, when the user starts an employment
-- application (the new "employment access" gate). This supersedes the
-- payment -> auto NIN-verification -> single-use access code pipeline added
-- in V20 (that columns stays in place, just unused going forward —
-- registrationStatus, fullName, accessCodeUsed, paymentReference,
-- verificationFailureReason, resubmitNinTokenHash/ExpiresAt are all
-- orphaned by this migration, not dropped).

ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emailOtpHash" TEXT,
  ADD COLUMN IF NOT EXISTS "emailOtpExpiresAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "loginOtpHash" TEXT,
  ADD COLUMN IF NOT EXISTS "loginOtpExpiresAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "accessCodeNin" TEXT,
  ADD COLUMN IF NOT EXISTS "accessCodeNinHash" TEXT,
  ADD COLUMN IF NOT EXISTS "accessCodePlaintext" TEXT;

-- NIN is no longer known at account-creation time — it's only collected
-- once the user pays for employment access.
ALTER TABLE applicants ALTER COLUMN nin DROP NOT NULL;

-- applicationStatus now spans the whole account -> access -> application
-- lifecycle in one enum, replacing the old two-enum (registrationStatus +
-- applicationStatus) split from V20.
ALTER TABLE applicants DROP CONSTRAINT IF EXISTS applicants_applicationstatus_check;
ALTER TABLE applicants
  ADD CONSTRAINT applicants_applicationstatus_check
  CHECK ("applicationStatus" IN (
    'not_started',
    'access_pending',
    'access_issued',
    'nin_verified',
    'in_progress',
    'submitted'
  ));
