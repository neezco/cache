import { defineConfig } from "tsdown";

const watchMode = process.env.TSDOWN_WATCH === "true";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",

  // Outputs
  format: ["esm", "cjs"],
  dts: true,
  exports: true,

  // Optimizations
  minify: false,
  sourcemap: true,
  clean: !watchMode,

  // External dependencies
  external: [],

  // Additional options
  treeshake: true,
  target: "es2022",

  // Watch mode
  watch: watchMode,
});
