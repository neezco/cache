import { describe, it, expect, beforeEach } from "vitest";

import { createCache, _resetInstanceCount } from "../src/cache/create-cache";
import { remainingStaleWindow } from "../src/cache/remaining-stale-ttl";
import { setOrUpdate } from "../src/cache/set";

describe("remainingStaleWindow", () => {
  beforeEach(() => {
    _resetInstanceCount();
  });

  const now = Date.now();

  it("returns 0 for non-existent key", () => {
    const state = createCache();
    expect(remainingStaleWindow(state, "missing", now)).toBe(0);
  });

  it("returns 0 when entry is not expired but has no stale window", () => {
    const state = createCache();

    // TTL futuro → no expirado
    setOrUpdate(state, { key: "k1", value: "v", ttl: 1000 }, now);

    // staleWindow = undefined → default 0
    // entry no expirado → remaining stale = 0
    expect(remainingStaleWindow(state, "k1", now + 10)).toBe(0);
  });

  it("returns remaining stale window when entry has staleWindow", () => {
    const state = createCache();

    setOrUpdate(state, { key: "k1", value: "v", ttl: 100, staleWindow: 200 }, now);

    // expiresAt      = now + 100
    // staleExpiresAt = expiresAt + 200 = now + 300
    // at now + 150 → remaining = 300 - 150 = 150
    expect(remainingStaleWindow(state, "k1", now + 150)).toBe(150);
  });

  it("returns 0 when stale window has passed", () => {
    const state = createCache();

    setOrUpdate(state, { key: "k1", value: "v", ttl: 100, staleWindow: 200 }, now);

    // staleExpiresAt = now + 300
    // now + 350 → stale already passed
    expect(remainingStaleWindow(state, "k1", now + 350)).toBe(0);
  });

  it("returns 0 when entry is expired and stale window is also expired", () => {
    const state = createCache();

    setOrUpdate(state, { key: "k1", value: "v", ttl: 50, staleWindow: 200 }, now);

    // expiresAt      = now + 50
    // staleExpiresAt = now + 250
    // later = now + 220 → entry expired but stale still valid → should return 30
    expect(remainingStaleWindow(state, "k1", now + 220)).toBe(30);
  });

  it("returns 0 when entry is expired and stale window has passed", () => {
    const state = createCache();

    setOrUpdate(state, { key: "k1", value: "v", ttl: 50, staleWindow: 200 }, now);

    // staleExpiresAt = now + 250
    // now + 300 → stale window passed
    expect(remainingStaleWindow(state, "k1", now + 300)).toBe(0);
  });
});
