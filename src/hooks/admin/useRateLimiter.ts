
import { useState, useCallback, useRef } from 'react';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  isBlocked: boolean;
  blockEndTime?: number;
}

export const useRateLimiter = () => {
  const [rateLimits] = useState<Map<string, RateLimitConfig>>(new Map([
    ['api_calls', { maxRequests: 100, windowMs: 60000 }], // 100 per minute
    ['login_attempts', { maxRequests: 5, windowMs: 300000, blockDurationMs: 900000 }], // 5 per 5min, block 15min
    ['data_export', { maxRequests: 3, windowMs: 3600000 }], // 3 per hour
    ['bulk_operations', { maxRequests: 10, windowMs: 60000 }] // 10 per minute
  ]));

  const requestCounts = useRef<Map<string, { count: number; windowStart: number; blockedUntil?: number }>>(new Map());

  const checkRateLimit = useCallback((action: string, identifier: string = 'default'): RateLimitStatus => {
    const key = `${action}:${identifier}`;
    const config = rateLimits.get(action);
    
    if (!config) {
      return { remaining: Infinity, resetTime: 0, isBlocked: false };
    }

    const now = Date.now();
    const existing = requestCounts.current.get(key);

    // Check if currently blocked
    if (existing?.blockedUntil && now < existing.blockedUntil) {
      return {
        remaining: 0,
        resetTime: existing.windowStart + config.windowMs,
        isBlocked: true,
        blockEndTime: existing.blockedUntil
      };
    }

    // Reset window if expired
    if (!existing || now - existing.windowStart >= config.windowMs) {
      requestCounts.current.set(key, {
        count: 0,
        windowStart: now,
        blockedUntil: existing?.blockedUntil && now < existing.blockedUntil ? existing.blockedUntil : undefined
      });
    }

    const current = requestCounts.current.get(key)!;
    const remaining = Math.max(0, config.maxRequests - current.count);
    const resetTime = current.windowStart + config.windowMs;

    return {
      remaining,
      resetTime,
      isBlocked: remaining === 0,
      blockEndTime: current.blockedUntil
    };
  }, [rateLimits]);

  const consumeRateLimit = useCallback((action: string, identifier: string = 'default'): boolean => {
    const status = checkRateLimit(action, identifier);
    
    if (status.isBlocked) {
      return false;
    }

    const key = `${action}:${identifier}`;
    const config = rateLimits.get(action);
    const existing = requestCounts.current.get(key);

    if (existing && config) {
      existing.count += 1;
      
      // If this puts us over the limit and there's a block duration, set it
      if (existing.count >= config.maxRequests && config.blockDurationMs) {
        existing.blockedUntil = Date.now() + config.blockDurationMs;
      }
      
      requestCounts.current.set(key, existing);
    }

    return true;
  }, [checkRateLimit, rateLimits]);

  const resetRateLimit = useCallback((action: string, identifier: string = 'default') => {
    const key = `${action}:${identifier}`;
    requestCounts.current.delete(key);
  }, []);

  const getAllRateLimitStatus = useCallback((identifier: string = 'default') => {
    const status: Record<string, RateLimitStatus> = {};
    
    for (const [action] of rateLimits) {
      status[action] = checkRateLimit(action, identifier);
    }
    
    return status;
  }, [rateLimits, checkRateLimit]);

  return {
    checkRateLimit,
    consumeRateLimit,
    resetRateLimit,
    getAllRateLimitStatus
  };
};
