import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ratelimit, checkInMemoryRateLimit } from '@/lib/rate-limit'
import { env } from '@/lib/env.mjs'

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Get IP address from proxy headers or request
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'
  
  try {
    if (env.UPSTASH_REDIS_REST_URL) {
      // Use Redis-based rate limiting if configured
      const result = await ratelimit.limit(ip)
      
      // Create headers object
      const headers = {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      }

      if (!result.success) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
          }
        )
      }

      // Create response with headers
      const response = NextResponse.next()
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    } else {
      // Fallback to in-memory rate limiting
      const success = await checkInMemoryRateLimit(ip)
      
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
      
      return NextResponse.next()
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // On error, allow the request to proceed but log the error
    return NextResponse.next()
  }
}

export const config = {
  matcher: '/api/:path*',
} 