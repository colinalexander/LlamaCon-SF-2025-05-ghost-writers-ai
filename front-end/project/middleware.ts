import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for authentication on protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/workspace') ||
      request.nextUrl.pathname.startsWith('/onboarding')) {
    
    const userId = request.cookies.get('userId');
    console.log('Middleware: Checking for user authentication:', userId?.value);
    
    if (!userId) {
      console.log('Middleware: No user ID found in cookies, redirecting to signin');
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    console.log('Middleware: User ID found in cookies, proceeding');
  }
  
  // Protect workspace routes
  if (request.nextUrl.pathname.startsWith('/workspace')) {
    const projectId = request.cookies.get('currentProjectId');
    console.log('Middleware: Checking for project cookie:', projectId?.value);
    console.log('Middleware: All cookies:', request.cookies.getAll());
    
    if (!projectId) {
      console.log('Middleware: No project ID found in cookies, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    console.log('Middleware: Project ID found in cookies, proceeding to workspace');
  }

  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api/workspace')) {
    // For GET requests, allow projectId from query params
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const projectIdFromQuery = url.searchParams.get('projectId');
      const projectIdFromHeader = request.headers.get('x-project-id');
      
      // Allow either query param or header for GET requests
      if (!projectIdFromQuery && !projectIdFromHeader) {
        console.log('Middleware: No project ID found in query params or headers');
        return NextResponse.json(
          { error: 'Project ID is required in query parameters or x-project-id header' },
          { status: 401 }
        );
      }
      
      console.log('Middleware: Project ID found, proceeding with API request');
    } else {
      // For non-GET requests, require the header
      const projectId = request.headers.get('x-project-id');
      
      if (!projectId) {
        console.log('Middleware: No project ID found in headers for non-GET request');
        return NextResponse.json(
          { error: 'Project ID is required in x-project-id header' },
          { status: 401 }
        );
      }
    }
  }

  // Validate content type for POST/PUT requests
  if (['POST', 'PUT'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/workspace/:path*',
    '/onboarding',
    '/api/workspace/:path*'
  ],
}
