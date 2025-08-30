import { headers } from 'next/headers';

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback for environments without crypto.randomUUID
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Get nonce from request headers (set by middleware)
 */
export async function getNonce(): Promise<string | null> {
    try {
        const headersList = await headers();
        return headersList.get('x-nonce') || null;
    } catch {
        return null;
    }
}

/**
 * Enhanced CSP directive builder with nonce support
 */
export function buildCSPWithNonce(nonce?: string, isDevelopment = false) {
    const nonceDirective = nonce ? `'nonce-${nonce}'` : '';

    const directives = {
        'default-src': ["'self'"],
        'script-src': [
            "'self'",
            ...(nonceDirective ? [nonceDirective] : []),
            ...(isDevelopment ? ["'unsafe-eval'"] : []),
            "'unsafe-inline'", // Keep for compatibility
            'https://vercel.live'
        ],
        'style-src': [
            "'self'",
            "'unsafe-inline'",
            ...(nonceDirective ? [nonceDirective] : [])
        ],
        'img-src': [
            "'self'",
            'data:',
            'https:',
            'blob:'
        ],
        'font-src': [
            "'self'",
            'data:'
        ],
        'connect-src': [
            "'self'",
            'https:',
            ...(isDevelopment ? ['ws:', 'wss:'] : ['wss:'])
        ],
        'frame-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"]
    };

    return Object.entries(directives)
        .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
        .join('; ') + (isDevelopment ? '' : '; upgrade-insecure-requests');
}

/**
 * Validate if current environment supports CSP
 */
export function isCSPSupported(): boolean {
    return typeof window !== 'undefined' && 'document' in window;
}
