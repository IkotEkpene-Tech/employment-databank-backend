-- Create access_codes table
CREATE TABLE access_codes (
    "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
    "code"        VARCHAR(12)   NOT NULL,
    "phoneNumber" VARCHAR(255)  NOT NULL,
    "usageCount"  INTEGER       NOT NULL DEFAULT 0,
    "maxUsage"    INTEGER       NOT NULL DEFAULT 5,
    "expiresAt"   TIMESTAMPTZ   NOT NULL,
    "isConsumed"  BOOLEAN       NOT NULL DEFAULT FALSE,
    "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT "access_codes_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "access_codes_code_key"        UNIQUE ("code"),
    CONSTRAINT "access_codes_phoneNumber_key" UNIQUE ("phoneNumber")
);