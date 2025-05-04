import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect workspace API routes
  if (request.nextUrl.pathname.startsWith('/api/workspace')) {
    const projectId = request.headers.get('x-project-id');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}