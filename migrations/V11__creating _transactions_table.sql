-- Create transactions table
CREATE TYPE "enum_transactions_status" AS ENUM ('pending', 'success', 'failed');

CREATE TABLE transactions (
    "id"          UUID                       NOT NULL DEFAULT gen_random_uuid(),
    "phoneNumber" VARCHAR(255)               NOT NULL,
    "reference"   VARCHAR(255)               NOT NULL,
    "amount"      INTEGER                    NOT NULL,
    "status"      "enum_transactions_status" NOT NULL DEFAULT 'pending',
    "createdAt"   TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ                NOT NULL DEFAULT NOW(),

    CONSTRAINT "transactions_pkey"           PRIMARY KEY ("id"),
    CONSTRAINT "transactions_reference_key"  UNIQUE ("reference")
);

COMMENT ON COLUMN transactions."amount" IS 'Amount in kobo';