-- V21__create_registration_drafts_table.sql

CREATE TABLE IF NOT EXISTS registration_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  "userId" UUID NOT NULL UNIQUE REFERENCES applicants(id) ON DELETE CASCADE,

  "values" JSONB NOT NULL DEFAULT '{}'::jsonb,

  step INTEGER NOT NULL DEFAULT 0,

  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_registration_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_registration_drafts_updated_at ON registration_drafts;

CREATE TRIGGER trg_update_registration_drafts_updated_at
BEFORE UPDATE ON registration_drafts
FOR EACH ROW
EXECUTE FUNCTION update_registration_drafts_updated_at();
