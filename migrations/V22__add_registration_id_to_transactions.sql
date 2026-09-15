-- V22__add_registration_id_to_transactions.sql

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS "registrationId" UUID REFERENCES applicants(id);

CREATE INDEX IF NOT EXISTS idx_transactions_registration_id
  ON transactions ("registrationId");
