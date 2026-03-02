import { database } from "./database";
import "../models/applicants/applicantModel"
import "../models/villages/villageModel";
import "../models/wards/wardModel";


export async function syncDatabases() {
  try {
    console.log('📥 Registering models...');
    console.log('🔄 Syncing databases...');

    await Promise.all([
      database.sync({}),
    ]);
    console.log('✅ All databases synced successfully');
  } catch (error) {
    console.error('❌ Error syncing databases:', error);
    throw error;
  }
}