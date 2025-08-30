import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSecurityHeaders } from './lib/security';

export function middleware(request: NextRequest) {
    // Clone the request headers
    const requestHeaders = new Headers(request.headers);

    // Create the response
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Apply security headers
    const isDevelopment = process.env.NODE_ENV === 'development';
    const securityHeaders = getSecurityHeaders(isDevelopment);

    securityHeaders.forEach(({ key, value }) => {
        response.headers.set(key, value);
    });

    return response;
}

export const config = {
    // Run middleware on all routes except static files and API routes that don't need CSP
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
