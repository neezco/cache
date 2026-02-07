# Examples

## API Response Caching

Cache API responses so you don't hammer your backend with repeated requests:

```javascript
const cache = new LocalTtlCache();

async function getUser(userId) {
  // Check cache first
  const cached = cache.get(`user:${userId}`);
  if (cached) return cached;

  // Not in cache or expired, fetch it
  const user = await fetch(`/api/users/${userId}`).then(r => r.json());

  // Store for 5 minutes, but serve stale for 1 more minute while refreshing
  cache.set(`user:${userId}`, user, {
    ttl: 5 * 60 * 1000,
    staleWindow: 1 * 60 * 1000,
    tags: `user:${userId}`, // Tag it for easy invalidation
  });

  return user;
}

// When a user updates their profile
function handleUserUpdate(userId) {
  cache.invalidateTag(`user:${userId}`); // Instantly clear their cache
}
```

## Database Query Caching

Speed up repeated database queries:

```javascript
const cache = new LocalTtlCache({
  defaultTtl: 2 * 60 * 1000, // 2 minutes
});

async function getProducts() {
  const cached = cache.get("products:list");
  if (cached) return cached;

  const products = await db.query("SELECT * FROM products");
  cache.set("products:list", products, { tags: "products" });
  return products;
}

async function deleteProduct(id) {
  await db.query("DELETE FROM products WHERE id = ?", [id]);
  cache.invalidateTag("products"); // Clear all product caches
}

async function updateProduct(id, data) {
  await db.query("UPDATE products SET ? WHERE id = ?", [data, id]);
  cache.invalidateTag("products"); // Clear all product caches
}
```

## Graceful Stale Data Serving

Keep serving old data while fetching fresh data in the background:

```javascript
const cache = new LocalTtlCache();

async function getWeatherWithBackground() {
  // Fresh for 5 minutes, but we'll serve it for 2 more minutes even if expired
  cache.set(
    "weather:NYC",
    { temp: 72, city: "NYC", fetched: Date.now() },
    {
      ttl: 5 * 60 * 1000,
      staleWindow: 2 * 60 * 1000, // Keep serving for 2 extra minutes while fetching
    },
  );
}

// NEXT skipStale, full entry
// This is perfect for UIs where slight data staleness is acceptable
// You can serve old data instantly while refreshing in the background
async function fetchWeatherIfNeeded(city) {
  let weather = cache.get(`weather:${city}`);

  // Stale? Fetch fresh data in the background
  if (!weather) {
    weather = await fetchWeatherAPI(city);
    getWeatherWithBackground(city, weather);
  }

  return weather;
}
```

## Tag-Based Invalidation

Group related data and clear it all at once:

```javascript
const cache = new LocalTtlCache();

// Store user data with a 'user:456' tag
cache.set("user:456:name", "Bob", { tags: ["user:456"] });
cache.set("user:456:email", "bob@example.com", { tags: ["user:456"] });
cache.set("user:456:preferences", { theme: "dark" }, { tags: ["user:456"] });

// User updates their profile - invalidate everything at once
cache.invalidateTag("user:456");

// All three are now expired
console.log(cache.get("user:456:name")); // undefined
console.log(cache.get("user:456:email")); // undefined
console.log(cache.get("user:456:preferences")); // undefined
```

## Multiple Tags Per Entry

An entry can have multiple tags for flexible invalidation:

```javascript
cache.set("user:789:profile", profileData, {
  ttl: 10 * 60 * 1000,
  tags: ["user:789", "profiles", "public-data"], // Multiple tags
});

// Invalidate just the user's data
cache.invalidateTag("user:789");

// Or invalidate all profiles
cache.invalidateTag("profiles");

// Or invalidate public data across the entire app
cache.invalidateTag("public-data");
```

---

## Navigation

- **[Getting Started](./getting-started.md)** - Back to basics
- **[API Reference](./api-reference.md)** - All methods explained
- **[Configuration](./configuration.md)** - Customize your cache
