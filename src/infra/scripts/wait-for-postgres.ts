import { exec } from "node:child_process";

let attempts = 0;
const MAX_ATTEMPTS = 30;

function checkPostgres() {
  exec("docker exec postgres-task pg_isready", (error, stdout) => {
    attempts++;

    if (stdout.includes("accepting connections")) {
      console.log("\n✅ Postgres pronto para conexões!");
      process.exit(0);
    }

    if (attempts >= MAX_ATTEMPTS) {
      console.error("\n❌ Erro: O Postgres não ficou pronto a tempo.");
      process.exit(1);
    }

    process.stdout.write(".");
    setTimeout(checkPostgres, 1000);
  });
}

process.stdout.write("\n⏳ Aguardando Postgres");
checkPostgres();
