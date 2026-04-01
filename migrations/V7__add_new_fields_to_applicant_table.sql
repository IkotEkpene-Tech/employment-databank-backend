-- V2__add_new_applicant_fields.sql

ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE,
ADD COLUMN IF NOT EXISTS "skillAcquisition" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "otherSkillAcquisition" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "certificateOfOrigin" TEXT;