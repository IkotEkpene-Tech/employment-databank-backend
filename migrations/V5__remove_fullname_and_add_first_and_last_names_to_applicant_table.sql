-- V{version}__replace_fullName_with_name_fields.sql

-- Step 1: Add new columns
ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS "surname" VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS "otherName" VARCHAR(255) NULL;

-- Step 2: Backfill surname and firstName from existing fullName
UPDATE applicants
SET
  "surname" = SPLIT_PART("fullName", ' ', 1),
  "firstName" = SUBSTRING("fullName" FROM POSITION(' ' IN "fullName") + 1)
WHERE "fullName" IS NOT NULL AND "fullName" <> '';

-- Step 3: Set NOT NULL after backfill
ALTER TABLE applicants
  ALTER COLUMN "surname" SET NOT NULL,
  ALTER COLUMN "firstName" SET NOT NULL;

-- Step 4: Drop fullName
ALTER TABLE applicants
  DROP COLUMN IF EXISTS "fullName";