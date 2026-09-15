ALTER TABLE applicants
  ALTER COLUMN "emailOtpExpiresAt" TYPE timestamptz USING "emailOtpExpiresAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "loginOtpExpiresAt" TYPE timestamptz USING "loginOtpExpiresAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "passwordResetTokenExpiresAt" TYPE timestamptz USING "passwordResetTokenExpiresAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "accessCodeExpiresAt" TYPE timestamptz USING "accessCodeExpiresAt" AT TIME ZONE 'UTC';