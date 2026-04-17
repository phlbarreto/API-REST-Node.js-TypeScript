import { runScript } from "./runScript.js";

export async function resetDatabase() {
  await runScript("migrations:reset");
}

export async function runPendingMigrations() {
  await runScript("migrations:up");
}
