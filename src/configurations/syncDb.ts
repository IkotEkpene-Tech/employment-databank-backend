import { database } from "./database";
import "../auth/User";
import "../auth/RegistrationDraft";
import "../payments/Transaction";
import "../wardsAndVillages/Village";
import "../wardsAndVillages/Ward";
import "../applicants/ApplicantIdCounter";
import "../complaints/Complaint";

export async function syncDatabases() {
  try {
    console.log("📥 Registering models...");
    console.log("🔄 Syncing databases...");

    await Promise.all([database.sync({})]);
    console.log("✅ All databases synced successfully");
  } catch (error) {
    console.error("❌ Error syncing databases:", error);
    throw error;
  }
}
