import { describe, it, expect } from "vitest";

import { createCache } from "../src/cache/create-cache";
import { setOrUpdate } from "../src/cache/set";

describe("setOrUpdate", () => {
  it("should set a valid entry", () => {
    const state = createCache();
    const now = Date.now();
    setOrUpdate(state, { key: "key1", value: "value1", ttlMs: 1000 }, now);
    const entry = state.store.get("key1");
    expect(entry).toBeDefined();
    expect(entry!.v).toBe("value1");
    expect(entry!.e).toBe(now + 1000);
    expect(entry!.se).toBe(0);
  });

  it("should set entry with staleTTLMs", () => {
    const state = createCache();
    const now = Date.now();
    setOrUpdate(state, { key: "key1", value: "value1", ttlMs: 1000, staleTTLMs: 2000 }, now);
    const entry = state.store.get("key1");
    expect(entry).toBeDefined();
    expect(entry!.v).toBe("value1");
    expect(entry!.e).toBe(now + 1000);
    expect(entry!.se).toBe(now + 2000);
  });

  it("should throw error if key is missing", () => {
    const state = createCache();
    expect(() =>
      setOrUpdate(state, { key: null as unknown as string, value: "value1", ttlMs: 1000 }),
    ).toThrow("Missing key.");
  });

  it("should throw error if value is missing", () => {
    const state = createCache();
    expect(() => setOrUpdate(state, { key: "key1", value: null, ttlMs: 1000 })).toThrow(
      "Missing value.",
    );
  });

  it("should throw error if ttlMs is not finite", () => {
    const state = createCache();
    expect(() => setOrUpdate(state, { key: "key1", value: "value1", ttlMs: NaN })).toThrow(
      "TTL must be a finite number.",
    );
  });

  it("should throw error if staleTTLMs is not finite", () => {
    const state = createCache();
    expect(() =>
      setOrUpdate(state, { key: "key1", value: "value1", ttlMs: 1000, staleTTLMs: Infinity }),
    ).toThrow("staleTTL must be a finite number.");
  });

  it("should use defaultTTL if not provided in input", () => {
    const state = createCache({ defaultTTL: 2000 });
    const now = Date.now();
    setOrUpdate(state, { key: "key1", value: "value1" }, now);
    const entry = state.store.get("key1");
    expect(entry!.e).toBe(now + 2000);
  });

  it("should use defaultStaleTTL if staleTTLMs not provided", () => {
    const state = createCache({ defaultStaleTTL: 3000 });
    const now = Date.now();
    setOrUpdate(state, { key: "key1", value: "value1", ttlMs: 1000 }, now);
    const entry = state.store.get("key1");
    expect(entry!.se).toBe(now + 3000);
  });
});
