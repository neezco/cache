import { describe, it, expect, beforeEach } from "vitest";

import { createCache, _resetInstanceCount } from "../src/cache/create-cache";
import { get } from "../src/cache/get";
import { invalidateTag } from "../src/cache/invalidate-tag";
import { setOrUpdate } from "../src/cache/set";
import { isExpired, isStale, isFresh } from "../src/cache/validators";

describe("invalidateTag behavior", () => {
  const now = Date.now();
  beforeEach(() => {
    _resetInstanceCount();
  });

  it("marks entries as expired when a tag is invalidated (and get deletes them)", () => {
    const state = createCache();

    setOrUpdate(state, { key: "a", value: "v", ttl: 1000, tags: "t" }, now);

    // invalidate tag slightly after creation
    invalidateTag(state, "t", {}, now + 10);

    const entry = state.store.get("a");
    expect(entry).toBeDefined();

    // After invalidation moment, entry should be considered expired
    expect(isExpired(state, entry!, now + 20)).toBe(true);

    // get should remove expired entries and return undefined
    const val = get(state, "a", now + 20);
    expect(val).toBeUndefined();
    expect(state.store.has("a")).toBe(false);
  });

  it("marks entries as stale when tag is invalidated as stale and purgeOnGet removes them if enabled", () => {
    // enable purgeStaleOnGet so get will delete stale entries after returning them
    const state = createCache({ purgeStaleOnGet: true });

    // entry has a stale window
    setOrUpdate(state, { key: "b", value: "v2", ttl: 1000, staleWindow: 2000, tags: "t2" }, now);

    // mark tag as stale after creation
    invalidateTag(state, "t2", { asStale: true }, now + 5);

    const entry = state.store.get("b");
    expect(entry).toBeDefined();

    // Even before the entry's own expiresAt, the tag forces a STALE status
    expect(isStale(state, entry!, now + 10)).toBe(true);

    // get should return the value but purge it because purgeStaleOnGet=true
    const val = get(state, "b", now + 10);
    expect(val).toBe("v2");
    expect(state.store.has("b")).toBe(false);
  });

  it("does not affect entries created after the tag invalidation", () => {
    const state = createCache();

    // invalidate tag at t1
    const t1 = now;
    invalidateTag(state, "tx", {}, t1);

    // create entry after invalidation
    const later = t1 + 100;
    setOrUpdate(state, { key: "c", value: "v3", ttl: 1000, tags: "tx" }, later);

    const entry = state.store.get("c");
    expect(entry).toBeDefined();

    // entry created after invalidation should remain fresh
    expect(isFresh(state, entry!, later + 10)).toBe(true);
  });

  it("stale invalidation does not override an expired invalidation (expired always dominates)", () => {
    const state = createCache();

    // entry con stale window
    setOrUpdate(state, { key: "x", value: "v", ttl: 1000, staleWindow: 2000, tags: "t" }, now);

    // primero expired
    invalidateTag(state, "t", {}, now + 10);

    // luego stale (no debe afectar expired)
    invalidateTag(state, "t", { asStale: true }, now + 20);

    const entry = state.store.get("x")!;

    // expired domina siempre
    expect(isExpired(state, entry, now + 30)).toBe(true);
    expect(isStale(state, entry, now + 30)).toBe(false);
  });

  it("tag stale invalidation does not affect entries without stale window", () => {
    const state = createCache();

    setOrUpdate(state, { key: "z", value: "v", ttl: 1000, tags: "t" }, now);

    invalidateTag(state, "t", { asStale: true }, now + 10);

    const entry = state.store.get("z")!;
    expect(isStale(state, entry, now + 20)).toBe(false);
    expect(isFresh(state, entry, now + 20)).toBe(true);
  });

  it("expired tag dominates stale tag", () => {
    const state = createCache();

    setOrUpdate(
      state,
      { key: "m", value: "v", ttl: 1000, staleWindow: 2000, tags: ["t1", "t2"] },
      now,
    );

    invalidateTag(state, "t1", { asStale: true }, now + 10);
    invalidateTag(state, "t2", {}, now + 20);

    const entry = state.store.get("m")!;
    expect(isExpired(state, entry, now + 30)).toBe(true);
  });

  it("stale applies if no expired tag applies", () => {
    const state = createCache();

    setOrUpdate(
      state,
      { key: "n", value: "v", ttl: 1000, staleWindow: 2000, tags: ["t1", "t2"] },
      now,
    );

    invalidateTag(state, "t1", { asStale: true }, now + 10);
    invalidateTag(state, "t2", { asStale: true }, now + 20);

    const entry = state.store.get("n")!;
    expect(isStale(state, entry, now + 30)).toBe(true);
  });
});
