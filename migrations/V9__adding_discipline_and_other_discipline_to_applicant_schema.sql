ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS discipline VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS "otherDiscipline" VARCHAR(255) NULL;
COMMENT ON COLUMN applicants.discipline IS 'Course or field of study selected from dropdown';
COMMENT ON COLUMN applicants."otherDiscipline" IS 'Free-text discipline when "Other" is selected';