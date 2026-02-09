import { describe, it, expect } from "vitest";

import { createCache } from "../src/cache/create-cache";
import { get } from "../src/cache/get";
import { setOrUpdate } from "../src/cache/set";

describe("maxSize limit", () => {
  const now = Date.now();

  it("should allow unlimited entries when maxSize is not set", () => {
    const state = createCache({ _autoStartSweep: false });
    const limit = 100;

    for (let i = 0; i < limit; i++) {
      setOrUpdate(state, { key: `key${i}`, value: `value${i}` }, now);
    }

    expect(state.size).toBe(limit);
  });

  it("should allow unlimited entries when maxSize is Infinity", () => {
    const state = createCache({ maxSize: Infinity, _autoStartSweep: false });
    const limit = 100;

    for (let i = 0; i < limit; i++) {
      setOrUpdate(state, { key: `key${i}`, value: `value${i}` }, now);
    }

    expect(state.size).toBe(limit);
  });

  it("should ignore new entries when maxSize limit is reached", () => {
    const state = createCache({ maxSize: 3, _autoStartSweep: false });

    setOrUpdate(state, { key: "key1", value: "value1" }, now);
    setOrUpdate(state, { key: "key2", value: "value2" }, now);
    setOrUpdate(state, { key: "key3", value: "value3" }, now);

    expect(state.size).toBe(3);

    // Try to add a 4th entry - should be ignored
    setOrUpdate(state, { key: "key4", value: "value4" }, now);

    expect(state.size).toBe(3);
    expect(get(state, "key4")).toBeUndefined();
  });

  it("should allow updating existing entries when maxSize is reached", () => {
    const state = createCache({ maxSize: 2, _autoStartSweep: false });

    setOrUpdate(state, { key: "key1", value: "value1" }, now);
    setOrUpdate(state, { key: "key2", value: "value2" }, now);

    expect(state.size).toBe(2);

    // Update existing key - should work even at maxSize
    setOrUpdate(state, { key: "key1", value: "updated" }, now + 100);

    expect(state.size).toBe(2);
    expect(get(state, "key1")).toBe("updated");
  });

  it("should allow new entries after existing ones are deleted", () => {
    const state = createCache({ maxSize: 2, _autoStartSweep: false });

    setOrUpdate(state, { key: "key1", value: "value1" }, now);
    setOrUpdate(state, { key: "key2", value: "value2" }, now);

    expect(state.size).toBe(2);

    // Delete one entry
    state.store.delete("key1");
    expect(state.size).toBe(1);

    // Add new entry - should work now
    setOrUpdate(state, { key: "key3", value: "value3" }, now);

    expect(state.size).toBe(2);
    expect(get(state, "key3")).toBe("value3");
  });

  it("should respect maxSize across multiple set operations", () => {
    const state = createCache({ maxSize: 5, _autoStartSweep: false });

    // Fill to capacity
    for (let i = 1; i <= 5; i++) {
      setOrUpdate(state, { key: `key${i}`, value: `value${i}` }, now);
    }

    expect(state.size).toBe(5);

    // Attempt to add beyond capacity
    for (let i = 6; i <= 10; i++) {
      setOrUpdate(state, { key: `key${i}`, value: `value${i}` }, now);
    }

    // Size should remain at 5
    expect(state.size).toBe(5);

    // Only keys 1-5 should exist
    for (let i = 1; i <= 5; i++) {
      expect(get(state, `key${i}`)).toBeDefined();
    }

    // Keys 6-10 should not exist
    for (let i = 6; i <= 10; i++) {
      expect(get(state, `key${i}`)).toBeUndefined();
    }
  });

  it("should allow multiple updates to same key at maxSize", () => {
    const state = createCache({ maxSize: 1, _autoStartSweep: false });

    setOrUpdate(state, { key: "only", value: "first" }, now);
    expect(state.size).toBe(1);

    // Update same key multiple times - all should work
    setOrUpdate(state, { key: "only", value: "second" }, now + 100);
    setOrUpdate(state, { key: "only", value: "third" }, now + 200);
    setOrUpdate(state, { key: "only", value: "fourth" }, now + 300);

    expect(state.size).toBe(1);
    expect(get(state, "only")).toBe("fourth");
  });
});
