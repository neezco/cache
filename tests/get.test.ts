import { describe, it, expect } from "vitest";

import { createCache } from "../src/cache/create-cache";
import { get } from "../src/cache/get";
import { setOrUpdate } from "../src/cache/set";

describe("get", () => {
  const now = Date.now();

  it("should return undefined for non-existent key", () => {
    const state = createCache();

    expect(get(state, "nonexistent")).toBe(undefined);
  });

  it("should return value for valid entry", () => {
    const state = createCache();

    setOrUpdate(state, { key: "key1", value: "value1", ttl: 1000 });
    expect(get(state, "key1")).toBe("value1");
  });

  it("should return value for stale entry", () => {
    const state = createCache();

    setOrUpdate(state, { key: "key1", value: "value1", ttl: 100, staleWindow: 200 }, now);
    expect(get(state, "key1", now + 150)).toBe("value1");
  });

  it("should purge stale entry if purgeStaleOnGet is set to true", () => {
    const state = createCache({ purgeStaleOnGet: true });

    setOrUpdate(state, { key: "key1", value: "value1", ttl: 100, staleWindow: 200 }, now);
    const firstGet = get(state, "key1", now + 150);
    expect(firstGet).toBe("value1");

    const secondGet = get(state, "key1", now + 160);
    expect(secondGet).toBe(undefined);
  });

  it("should return undefined for expired entry", () => {
    const state = createCache();

    setOrUpdate(state, { key: "key1", value: "value1", ttl: 100 }, now);
    expect(get(state, "key1", now + 200)).toBe(undefined);
  });

  it("should purges a stale entry when purgeStaleOnGet=true and staleWindow=Infinity", () => {
    const state = createCache({ purgeStaleOnGet: true });

    setOrUpdate(state, { key: "key1", value: "value1", ttl: 100, staleWindow: Infinity }, now);
    const firstGet = get(state, "key1", now + 150);
    expect(firstGet).toBe("value1");

    const secondGet = get(state, "key1", now + 160);
    expect(secondGet).toBe(undefined);
  });

  it("should retains a stale entry when purgeStaleOnGet=false and staleWindow=Infinity", () => {
    // purge stale entries only on sweep
    const state = createCache({ purgeStaleOnGet: false });

    setOrUpdate(state, { key: "key1", value: "value1", ttl: 100, staleWindow: Infinity }, now);
    const firstGet = get(state, "key1", now + 150);
    expect(firstGet).toBe("value1");

    const secondGet = get(state, "key1", now + 160);
    expect(secondGet).toBe("value1");
  });
});
