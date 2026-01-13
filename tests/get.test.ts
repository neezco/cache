import { describe, it, expect } from "vitest";

import { createCache } from "../src/cache/create-cache";
import { get } from "../src/cache/get";
import { setOrUpdate } from "../src/cache/set";

describe("get", () => {
  it("should return null for non-existent key", () => {
    const state = createCache();
    expect(get(state, "nonexistent")).toBe(null);
  });

  it("should return value for valid entry", () => {
    const state = createCache();
    setOrUpdate(state, { key: "key1", value: "value1", ttlMs: 1000 });
    expect(get(state, "key1")).toBe("value1");
  });

  it("should return value for stale entry", () => {
    const state = createCache();
    const now = Date.now();
    setOrUpdate(state, { key: "key1", value: "value1", ttlMs: 100, staleTTLMs: 200 }, now);
    expect(get(state, "key1", now + 150)).toBe("value1");
  });

  it("should return null for expired entry", () => {
    const state = createCache();
    const now = Date.now();
    setOrUpdate(state, { key: "key1", value: "value1", ttlMs: 100 }, now);
    expect(get(state, "key1", now + 200)).toBe(null);
  });
});
