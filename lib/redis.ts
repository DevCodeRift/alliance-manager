import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  NATION_DATA: 300, // 5 minutes
  ALLIANCE_DATA: 600, // 10 minutes
  ALLIANCE_MEMBERS: 300, // 5 minutes
} as const

// Helper function to get cached data or fetch and cache
export async function getCachedData<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get<T>(key)
    if (cached) {
      return cached
    }

    // If not in cache, fetch the data
    const data = await fetchFn()

    // Store in cache with TTL
    await redis.setex(key, ttl, JSON.stringify(data))

    return data
  } catch (error) {
    console.error('Redis cache error:', error)
    // Fallback to direct fetch if Redis fails
    return fetchFn()
  }
}

// Helper to invalidate cache
export async function invalidateCache(pattern: string) {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Redis invalidation error:', error)
  }
}

// Helper to get or set cache
export async function getOrSetCache<T>(
  key: string,
  ttl: number,
  value: T
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error('Redis set error:', error)
  }
}
