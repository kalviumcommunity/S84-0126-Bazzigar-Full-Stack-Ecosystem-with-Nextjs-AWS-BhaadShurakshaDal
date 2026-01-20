import redis from "../lib/redis";

/**
 * Check if Redis connection is ready
 */
function isRedisReady(): boolean {
  try {
    return redis && redis.status === "ready";
  } catch {
    return false;
  }
}

/**
 * Get cached data by key
 * @param key Cache key
 * @returns Cached data or null if not found/error
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // Skip if Redis is not available
  if (!isRedisReady()) {
    console.warn(`⚠️ Redis not ready, skipping GET for key "${key}"`);
    return null;
  }

  try {
    const data = await redis.get(key);
    if (data) {
      console.log(`✅ Cache HIT: ${key}`);
      return JSON.parse(data) as T;
    }
    console.log(`⚠️ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`❌ Cache GET error for key "${key}":`, error);
    return null; // Fallback to DB
  }
}

/**
 * Set cache with TTL
 * @param key Cache key
 * @param value Data to cache
 * @param ttl Time to live in seconds (default: 300)
 */
export async function setCache<T>(
  key: string,
  value: T | null,
  ttl = 300,
): Promise<void> {
  // Skip if Redis is not available
  if (!isRedisReady()) {
    console.warn(`⚠️ Redis not ready, skipping SET for key "${key}"`);
    return;
  }

  try {
    if (value === null) {
      // Delete key if value is null
      await redis.del(key);
      console.log(`🗑️ Cache CLEARED: ${key}`);
    } else {
      await redis.set(key, JSON.stringify(value), "EX", ttl);
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
    }
  } catch (error) {
    console.error(`⚠️ Cache SET error for key "${key}":`, error);
    // Don't throw - let app continue without cache
  }
}

/**
 * Delete cache by key
 * @param key Cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  // Skip if Redis is not available
  if (!isRedisReady()) {
    console.warn(`⚠️ Redis not ready, skipping DELETE for key "${key}"`);
    return;
  }

  try {
    await redis.del(key);
    console.log(`🗑️ Cache INVALIDATED: ${key}`);
  } catch (error) {
    console.error(`⚠️ Cache DELETE error for key "${key}":`, error);
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  if (!isRedisReady()) {
    console.warn("⚠️ Redis not ready, skipping FLUSH");
    return;
  }

  try {
    await redis.flushdb();
    console.log("🗑️ All cache CLEARED");
  } catch (error) {
    console.error("⚠️ Cache FLUSH error:", error);
  }
}
