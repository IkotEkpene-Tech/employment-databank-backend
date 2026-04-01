-- V3__add_nin_vin_hash_columns.sql

ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS "ninHash" TEXT,
ADD COLUMN IF NOT EXISTS "vinHash" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS applicants_nin_hash_unique ON applicants ("ninHash");
CREATE UNIQUE INDEX IF NOT EXISTS applicants_vin_hash_unique ON applicants ("vinHash");