-- V{version}__make_applicants_fields_nullable.sql

ALTER TABLE applicants
    ALTER COLUMN "vin"                   DROP NOT NULL,
    ALTER COLUMN "gender"                DROP NOT NULL,
    ALTER COLUMN "dateOfBirth"           DROP NOT NULL,
    ALTER COLUMN "certificateOfOrigin"   DROP NOT NULL,
    ALTER COLUMN "ward"                  DROP NOT NULL,
    ALTER COLUMN "village"               DROP NOT NULL,
    ALTER COLUMN "hasEducation"          DROP NOT NULL,
    ALTER COLUMN "villageHeadName"       DROP NOT NULL,
    ALTER COLUMN "villageHeadPhone"      DROP NOT NULL;