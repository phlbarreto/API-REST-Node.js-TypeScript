import { runScript } from "./runScript.js";

export async function runPendingMigrations() {
  await runScript("migrations:deploy");
}
