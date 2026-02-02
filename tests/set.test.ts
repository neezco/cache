import { describe, it, expect, beforeEach } from "vitest";

import { createCache, _resetInstanceCount } from "../src/cache/create-cache";
import { setOrUpdate } from "../src/cache/set";

describe("setOrUpdate", () => {
  beforeEach(() => {
    _resetInstanceCount();
  });

  const now = Date.now();

  it("should set a valid entry", () => {
    const state = createCache();
    setOrUpdate(state, { key: "key1", value: "value1", ttl: 1000 }, now);
    const entry = state.store.get("key1");
    expect(entry).toBeDefined();
    expect(entry![1]).toBe("value1");
    expect(entry![0][1]).toBe(now + 1000); // expiresAt
    expect(entry![0][2]).toBe(0); // staleExpiresAt
  });

  it("should set entry with staleWindow relative to ttl", () => {
    const state = createCache();
    setOrUpdate(state, { key: "key1", value: "value1", ttl: 1000, staleWindow: 2000 }, now);

    const entry = state.store.get("key1");

    // expiresAt = now + 1000
    // staleExpiresAt = expiresAt + 2000 = now + 3000
    expect(entry![0][2]).toBe(now + 1000 + 2000);
  });

  it("should throw error if key is missing", () => {
    const state = createCache();
    expect(() =>
      setOrUpdate(state, { key: null as unknown as string, value: "value1", ttl: 1000 }),
    ).toThrow("Missing key.");
  });

  it("should set entry with null value", () => {
    const state = createCache();
    setOrUpdate(state, { key: "key1", value: null }, now);

    const entry = state.store.get("key1");
    expect(entry![1]).toBe(null);
  });

  it("should ignore entry with undefined value", () => {
    const state = createCache();

    setOrUpdate(state, { key: "key1", value: "before" }, now);
    setOrUpdate(state, { key: "key1", value: undefined }, now);

    const entry = state.store.get("key1");
    expect(entry![1]).toBe("before");
  });

  it("should use defaultTtl if not provided in input", () => {
    const state = createCache({ defaultTtl: 2000 });
    setOrUpdate(state, { key: "key1", value: "value1" }, now);

    const entry = state.store.get("key1");
    expect(entry![0][1]).toBe(now + 2000);
  });

  it("should use defaultStaleWindow if staleWindow not provided", () => {
    const state = createCache({ defaultStaleWindow: 3000 });
    setOrUpdate(state, { key: "key1", value: "value1", ttl: 1000 }, now);

    const entry = state.store.get("key1");

    // expiresAt = now + 1000
    // staleExpiresAt = expiresAt + 3000 = now + 4000
    expect(entry![0][2]).toBe(now + 1000 + 3000);
  });
});
