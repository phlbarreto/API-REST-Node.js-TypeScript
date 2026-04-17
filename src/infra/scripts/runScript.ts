import { spawn } from "node:child_process";

function npmBin() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function cleanServices(service: string) {
  console.log(`Serviço '${service}' encerrado`);
  const stopServices = spawn(npmBin(), ["run", "services:stop"], {
    stdio: "inherit",
    shell: true,
  });
  stopServices.on("exit", () => {
    console.log("Serviços finalizados com sucesso!");
  });
}

export function runScript(script: string, service?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const runStartScript = spawn(npmBin(), ["run", script], {
      shell: true,
      stdio: "inherit",
    });

    runStartScript.on("error", (err) => {
      reject(err);
    });

    runStartScript.on("exit", (code) => {
      if (service) cleanServices(service);

      if (code === 0) resolve();
      else reject(new Error(`Script ${script} falhou com codigo ${code}`));
    });

    const handleSignal = (signal: NodeJS.Signals) => {
      if (runStartScript.killed) return;
      runStartScript.kill(signal);
    };

    process.on("SIGINT", () => handleSignal("SIGINT"));
    process.on("SIGTERM", () => handleSignal("SIGTERM"));
  });
}
