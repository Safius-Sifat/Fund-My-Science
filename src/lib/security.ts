/**
 * Content Security Policy configuration for FundMyScience
 * Handles CSP headers for different environments and integrations
 */

// Supabase and external service domains
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '';
const allowedDomains = [
    SUPABASE_URL,
    '*.supabase.co',
    '*.supabase.in',
    'vercel.live',
    'vitals.vercel-insights.com'
];

export const getCSPDirectives = (isDevelopment: boolean) => {
    const baseDirectives = {
        'default-src': ["'self'"],
        'script-src': [
            "'self'",
            ...(isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : ["'unsafe-inline'"]),
            'https://vercel.live',
            'https://vitals.vercel-insights.com'
        ],
        'style-src': [
            "'self'",
            "'unsafe-inline'"
        ],
        'img-src': [
            "'self'",
            'data:',
            'https:',
            'blob:',
            ...allowedDomains.map(domain => `https://${domain}`)
        ],
        'font-src': [
            "'self'",
            'data:'
        ],
        'connect-src': [
            "'self'",
            'https:',
            ...(isDevelopment ? ['ws:', 'wss:'] : ['wss:']),
            ...allowedDomains.map(domain => `https://${domain}`),
            ...allowedDomains.map(domain => `wss://${domain}`)
        ],
        'frame-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': []
    };

    // Convert to CSP string format
    return Object.entries(baseDirectives)
        .map(([directive, sources]) =>
            sources.length > 0
                ? `${directive} ${sources.join(' ')}`
                : directive
        )
        .join('; ');
};

export const getSecurityHeaders = (isDevelopment: boolean) => [
    {
        key: 'Content-Security-Policy',
        value: getCSPDirectives(isDevelopment)
    },
    {
        key: 'X-Frame-Options',
        value: 'DENY'
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    },
    {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
    }
];
