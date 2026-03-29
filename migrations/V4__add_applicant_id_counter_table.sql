
CREATE TABLE IF NOT EXISTS applicant_id_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prefix VARCHAR(255) NOT NULL UNIQUE,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN applicant_id_counters.prefix IS 'Unique prefix per ward-village combination e.g. IK-WARD05-IOE';
COMMENT ON COLUMN applicant_id_counters."lastNumber" IS 'Last used sequence number for this prefix';