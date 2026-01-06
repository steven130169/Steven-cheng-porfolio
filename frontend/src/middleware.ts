import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for Admin API authentication
 * Checks Bearer token for all /api/admin/* routes
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization');
    const expectedKey = `Bearer ${process.env.ADMIN_API_KEY}`;

    if (authHeader !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/:path*',
};
