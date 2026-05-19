const cache = new Map();

export function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

export function cacheSet(key, value, ttlMs = 300000) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function cacheInvalidate(pattern) {
  for (const key of cache.keys()) {
    if (pattern === "*" || key.startsWith(pattern)) {
      cache.delete(key);
    }
  }
}

export function cacheStats() {
  return { size: cache.size, keys: [...cache.keys()] };
}

export function cacheClear() {
  cache.clear();
}
