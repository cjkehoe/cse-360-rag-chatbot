import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env } from './env.mjs'

// Create Redis instance with direct configuration
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL || '',
  token: env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Create a new ratelimiter that allows 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
  redis,  // Use the configured Redis instance
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
})

// Fallback in-memory rate limiter if Redis is not configured
const inMemoryStore = new Map<string, { count: number; timestamp: number }>()

export async function checkInMemoryRateLimit(identifier: string): Promise<boolean> {
  const now = Date.now()
  const windowMs = 10000 // 10 seconds
  const maxRequests = 10

  const record = inMemoryStore.get(identifier)
  
  if (!record) {
    inMemoryStore.set(identifier, { count: 1, timestamp: now })
    return true
  }

  if (now - record.timestamp > windowMs) {
    inMemoryStore.set(identifier, { count: 1, timestamp: now })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
} 