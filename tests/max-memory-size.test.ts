import { describe, it, expect } from "vitest";

import { createCache } from "../src/cache/create-cache";
import { get } from "../src/cache/get";
import { setOrUpdate } from "../src/cache/set";

describe("maxMemorySize limit (Node.js)", () => {
  const now = Date.now();

  it("should allow unlimited memory when maxMemorySize is not set", () => {
    const state = createCache({ _autoStartSweep: false });

    // Add entries until many kilobytes of data
    for (let i = 0; i < 100; i++) {
      const largeValue = "x".repeat(10_000); // ~10KB per entry
      setOrUpdate(state, { key: `key${i}`, value: largeValue }, now);
    }

    // Should accept all entries
    expect(state.size).toBe(100);
  });

  it("should allow unlimited memory when maxMemorySize is Infinity", () => {
    const state = createCache({ maxMemorySize: Infinity, _autoStartSweep: false });

    for (let i = 0; i < 50; i++) {
      const largeValue = "x".repeat(10_000);
      setOrUpdate(state, { key: `key${i}`, value: largeValue }, now);
    }

    expect(state.size).toBe(50);
  });

  it("should allow updating existing entries even when memory limit might be exceeded", () => {
    const state = createCache({ maxMemorySize: 0.001, _autoStartSweep: false }); // Very small limit

    const largeValue = "x".repeat(1000);
    setOrUpdate(state, { key: "key1", value: largeValue }, now);

    // Initial value set (may or may not succeed depending on memory)
    // But updating should always be allowed
    setOrUpdate(state, { key: "key1", value: "small" }, now + 100);

    expect(get(state, "key1")).toBe("small");
  });

  it("should pass through when memory metrics are not available", () => {
    // This test ensures graceful degradation when metrics are unavailable
    const state = createCache({ maxMemorySize: 1, _autoStartSweep: false });

    // Should not throw an error even with memory limit
    expect(() => {
      setOrUpdate(state, { key: "key1", value: "value1" }, now);
    }).not.toThrow();
  });

  it("should maintain maxSize behavior independently of maxMemorySize", () => {
    const state = createCache({
      maxSize: 3,
      maxMemorySize: 1024,
      _autoStartSweep: false,
    });

    setOrUpdate(state, { key: "key1", value: "value1" }, now);
    setOrUpdate(state, { key: "key2", value: "value2" }, now);
    setOrUpdate(state, { key: "key3", value: "value3" }, now);

    // maxSize limit should be enforced first
    expect(state.size).toBe(3);

    // Attempting to add beyond maxSize should fail
    setOrUpdate(state, { key: "key4", value: "value4" }, now);
    expect(get(state, "key4")).toBeUndefined();
  });
});
