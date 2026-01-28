import { defineConfig } from "tsdown";

// --- Share config ---
const base = {
  entry: ["src/index.ts"],
  dts: true,
  exports: true,
  minify: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
};

const browserConfig = defineConfig({
  ...base,
  outDir: "dist/browser",
  format: ["esm"],
  platform: "browser",
  external: ["fs", "v8", "perf_hooks"],
  treeshake: {
    moduleSideEffects(id: string, external: boolean) {
      if (id === "fs" || id === "v8" || id === "perf_hooks") {
        return false;
      }
      return undefined;
    },
  },

  define: {
    __BROWSER__: "true",
  },
});

const nodeConfig = defineConfig({
  ...base,
  outDir: "dist/node",
  format: ["esm", "cjs"],
  platform: "node",
  external: [],
  define: {
    __BROWSER__: "false",
  },
});

export default [nodeConfig, browserConfig];
