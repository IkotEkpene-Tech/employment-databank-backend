-- 1️⃣ Rename existing enum type
ALTER TYPE "enum_applicants_highestQualification"
RENAME TO "enum_applicants_highestQualification_old";
-- 2️⃣ Create new enum type with correct values
CREATE TYPE "enum_applicants_highestQualification" AS ENUM (
    'primary',
    'ssce',
    'ond',
    'hnd',
    'bsc',
    'post-bsc'
);
-- 3️⃣ Alter column to use new enum
ALTER TABLE applicants
ALTER COLUMN "highestQualification" TYPE "enum_applicants_highestQualification" USING "highestQualification"::text::"enum_applicants_highestQualification";
-- 4️⃣ Drop old enum type
DROP TYPE "enum_applicants_highestQualification_old";