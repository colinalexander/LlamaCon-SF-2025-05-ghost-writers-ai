import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect workspace routes
  if (request.nextUrl.pathname.startsWith('/workspace')) {
    const projectId = request.cookies.get('currentProjectId');
    
    if (!projectId) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api/workspace')) {
    const projectId = request.headers.get('x-project-id');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 401 }
      );
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
    '/workspace/:path*',
    '/api/workspace/:path*'
  ],
}