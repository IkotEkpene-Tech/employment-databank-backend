-- V27__access_code_trials_and_email_binding.sql
--
-- Access codes are now tied to the account (email), not to a NIN, and carry a
-- limited number of NIN-verification trials. Each trial is one billable call
-- to the NIN provider (LumiID, ~N110 each), so a code (N500) gets 4 trials.
--
-- The NIN is no longer collected at payment time. It is supplied (and saved)
-- in the employment-registration flow, where the one provider call is made.
-- "ninVerification*" holds that call's result between POST /verify and
-- POST /confirm so /confirm never has to call the provider a second time.
--
-- accessCodeNin / accessCodeNinHash are orphaned by this migration (not
-- dropped), same convention as V24.

ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS "accessCodeMaxTrials" INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS "accessCodeTrialsUsed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "ninVerificationHash" TEXT,
  ADD COLUMN IF NOT EXISTS "ninVerificationData" TEXT;

ALTER TABLE applicants
  DROP CONSTRAINT IF EXISTS applicants_access_code_trials_check;
ALTER TABLE applicants
  ADD CONSTRAINT applicants_access_code_trials_check
  CHECK ("accessCodeTrialsUsed" >= 0 AND "accessCodeTrialsUsed" <= "accessCodeMaxTrials");

COMMENT ON COLUMN applicants."accessCodeMaxTrials" IS 'NIN-verification trials granted per paid access code';
COMMENT ON COLUMN applicants."accessCodeTrialsUsed" IS 'Trials consumed on the current access code (only provider responses count)';
COMMENT ON COLUMN applicants."ninVerificationHash" IS 'Lookup hash of the NIN whose provider result is cached in ninVerificationData';
COMMENT ON COLUMN applicants."ninVerificationData" IS 'Encrypted provider result awaiting user confirmation; cleared on confirm or new payment';
