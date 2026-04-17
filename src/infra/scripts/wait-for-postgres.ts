import { exec } from "node:child_process";

function checkPostgres() {
  exec("docker exec postgres-task pg_isready --host localhost", handleReturn);
  function handleReturn(error: any, stdout: any) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }
    console.log("\nPostgres pronto!\n");
  }
}
console.log('wait-for-postgres: Iniciou o CI');

process.stdout.write("\n\nAguardando Postgres");

checkPostgres();
