-- VXXX__create_complaints_table.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'complaint_status_enum'
  ) THEN
    CREATE TYPE complaint_status_enum AS ENUM (
      'pending',
      'in_progress',
      'resolved'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  nin TEXT NOT NULL,

  "fullName" VARCHAR(150) NOT NULL,

  "phoneNumber" VARCHAR(20) NOT NULL,

  "errorEncountered" VARCHAR(255),

  description TEXT NOT NULL,

  "currentPage" TEXT NOT NULL,

  status complaint_status_enum NOT NULL DEFAULT 'pending',

  "resolvedAt" TIMESTAMP NULL,

  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaints_phone_number
  ON complaints ("phoneNumber");

CREATE INDEX IF NOT EXISTS idx_complaints_status
  ON complaints (status);

CREATE INDEX IF NOT EXISTS idx_complaints_created_at
  ON complaints ("createdAt");

CREATE INDEX IF NOT EXISTS idx_complaints_resolved_at
  ON complaints ("resolvedAt");

CREATE OR REPLACE FUNCTION update_complaints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_complaints_updated_at ON complaints;

CREATE TRIGGER trg_update_complaints_updated_at
BEFORE UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION update_complaints_updated_at();