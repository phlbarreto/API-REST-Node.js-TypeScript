import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@": path.resolve(__dirname, "./prisma"),
      $: path.resolve(__dirname, "./tests"),
    },
    testTimeout: 60_000,
    environment: "node",
    globals: true,
    reporters: ["tree"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
  },
});
