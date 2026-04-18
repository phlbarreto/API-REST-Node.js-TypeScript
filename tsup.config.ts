import { defineConfig } from "tsup";
import path from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  clean: true,
  esbuildOptions(options) {
    options.alias = {
      "~": path.resolve("./src"),
      "@": path.resolve("./prisma"),
      "$": path.resolve("./tests"),
    };
  },
});