import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Debug middleware for Tavus API routes
 * 
 * This middleware logs all requests to Tavus API routes to help debug issues.
 */
export function middleware(request: NextRequest) {
  // Get the path from the URL
  const path = request.nextUrl.pathname;
  
  // Log the request
  console.log(`DEBUG MIDDLEWARE: Request to ${path}`);
  
  // Log headers
  console.log('DEBUG MIDDLEWARE: Request headers:', Object.fromEntries(request.headers));
  
  // Log referrer if available
  const referrer = request.headers.get('referer');
  if (referrer) {
    console.log('DEBUG MIDDLEWARE: Request referrer:', referrer);
  }
  
  // Log user agent
  const userAgent = request.headers.get('user-agent');
  if (userAgent) {
    console.log('DEBUG MIDDLEWARE: User agent:', userAgent);
  }
  
  // Continue to the route handler
  return NextResponse.next();
}

// Only apply this middleware to Tavus video status routes
export const config = {
  matcher: '/api/tavus/video/status/:path*',
};
