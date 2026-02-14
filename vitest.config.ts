import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    __BROWSER__: "false",
  },
  test: {
    setupFiles: ["./tests/setup.ts"],
  },
});
