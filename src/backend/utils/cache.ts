interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function cacheGet<T = unknown>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T = unknown>(key: string, value: T, ttlMs = 300000): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function cacheInvalidate(pattern: string): void {
  for (const key of cache.keys()) {
    if (pattern === "*" || key.startsWith(pattern)) {
      cache.delete(key);
    }
  }
}

export function cacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: [...cache.keys()] };
}

export function cacheClear(): void {
  cache.clear();
}
