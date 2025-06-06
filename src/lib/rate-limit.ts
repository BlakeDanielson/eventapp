import { NextRequest } from 'next/server';

// Simple in-memory rate limiting for MVP
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // requests per window

export function rateLimit(request: NextRequest): { success: boolean; reset: number } {
  const ip = request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'anonymous';
  const now = Date.now();
  
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now - userLimit.lastReset > WINDOW_SIZE) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true, reset: now + WINDOW_SIZE };
  }
  
  if (userLimit.count >= MAX_REQUESTS) {
    return { success: false, reset: userLimit.lastReset + WINDOW_SIZE };
  }
  
  userLimit.count++;
  return { success: true, reset: userLimit.lastReset + WINDOW_SIZE };
} 