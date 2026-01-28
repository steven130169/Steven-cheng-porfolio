import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Handles proxying requests with authentication for admin API routes.
 *
 * @param {NextRequest} request - The incoming request object.
 * @return {NextResponse} A response object indicating success or an error status based on authentication.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization');
    const adminApiKey = process.env.ADMIN_API_KEY || 'test-admin-key';
    const expectedKey = `Bearer ${adminApiKey}`;

    if (authHeader !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

/**
 * Configuration object for defining API route matching behavior.
 *
 * @property {string} matcher - Specifies the route pattern to match against API requests.
 *                              In this case, it matches requests starting with '/api/admin/'
 *                              followed by any path segments.
 */
export const config = {
  matcher: '/api/admin/:path*',
};
