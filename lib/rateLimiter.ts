/**
 * In-memory rate limiter for API endpoints
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Checks if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param maxRequests - Maximum requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 1000 // 1 minute
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(identifier);
  }

  const currentEntry = rateLimitStore.get(identifier);

  if (!currentEntry) {
    // First request
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (currentEntry.count >= maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  currentEntry.count++;
  return true;
}

/**
 * Gets remaining requests before rate limit
 * @param identifier - Unique identifier
 * @param maxRequests - Maximum requests allowed
 * @returns Number of remaining requests
 */
export function getRemainingRequests(identifier: string, maxRequests: number = 5): number {
  const entry = rateLimitStore.get(identifier);
  if (!entry) return maxRequests;
  return Math.max(0, maxRequests - entry.count);
}

/**
 * Resets rate limit for a specific identifier
 * @param identifier - Unique identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}
