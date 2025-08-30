# Content Security Policy (CSP) Configuration

This document explains the CSP implementation for FundMyScience platform.

## Overview

Content Security Policy (CSP) is a security standard that helps prevent Cross-Site Scripting (XSS) attacks, data injection attacks, and other security vulnerabilities by controlling which resources the browser is allowed to load.

## Implementation

### 1. Middleware CSP (`src/middleware.ts`)

The middleware sets CSP headers for all requests:

```typescript
// Development CSP - allows eval for hot reloading
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live

// Production CSP - more restrictive
script-src 'self' 'unsafe-inline'
```

### 2. Security Configuration (`src/lib/security.ts`)

Centralized CSP configuration that:
- Supports different environments (development/production)
- Handles Supabase domains dynamically
- Configures all CSP directives

### 3. CSP Utilities (`src/lib/csp.ts`)

Helper functions for:
- Nonce generation for stricter CSP
- CSP directive building
- Environment detection

### 4. CSP Components (`src/components/CSPComponents.tsx`)

React components for CSP-safe inline scripts and styles:
- `CSPScript` - Safe inline script execution
- `CSPStyle` - Safe inline styles
- `useCSPNonce` - Hook for client-side nonce access

## CSP Directives Explained

| Directive | Development | Production | Purpose |
|-----------|-------------|------------|---------|
| `default-src` | `'self'` | `'self'` | Default policy for all resources |
| `script-src` | `'self' 'unsafe-eval' 'unsafe-inline'` | `'self' 'unsafe-inline'` | JavaScript execution |
| `style-src` | `'self' 'unsafe-inline'` | `'self' 'unsafe-inline'` | CSS styles |
| `img-src` | `'self' data: https: blob:` | `'self' data: https: blob:` | Images |
| `connect-src` | `'self' https: wss: ws:` | `'self' https: wss:` | Network requests |
| `font-src` | `'self' data:` | `'self' data:` | Fonts |

## Development vs Production

### Development Mode
- Allows `'unsafe-eval'` for Next.js hot reloading
- Permits WebSocket connections for development server
- Includes CSP violation reporting

### Production Mode
- Stricter policies without `'unsafe-eval'`
- Limited to HTTPS connections
- Enhanced security headers

## Supabase Integration

The CSP configuration automatically includes Supabase domains:
- `*.supabase.co` - Main Supabase services
- `*.supabase.in` - Alternative Supabase domains
- Storage buckets for file uploads

## Troubleshooting CSP Issues

### 1. Enable Violation Reporting
In development, CSP violations are logged to the console with details:
- Blocked URI
- Violated directive  
- Source file and line number

### 2. Common Issues and Solutions

**Issue**: `eval` blocked in development
**Solution**: The configuration already allows `'unsafe-eval'` in development

**Issue**: Inline styles blocked
**Solution**: Using `'unsafe-inline'` for styles, or use CSP nonce

**Issue**: External resources blocked
**Solution**: Add domains to the appropriate CSP directive

**Issue**: WebSocket connections blocked
**Solution**: Included `wss:` in `connect-src` for development

### 3. Testing CSP

```bash
# Test CSP headers
curl -I http://localhost:3000

# Check for CSP violations in browser console
# Open DevTools → Console → Look for CSP violation messages
```

## Best Practices

1. **Use CSP Components** for inline scripts/styles
2. **Test thoroughly** in both development and production
3. **Monitor violations** in production with reporting
4. **Keep policies minimal** - only allow what's needed
5. **Use nonces** for dynamic content when possible

## Security Headers

In addition to CSP, the following security headers are set:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Enables XSS filtering
- `Referrer-Policy: origin-when-cross-origin` - Controls referrer info

## Environment Variables

CSP configuration uses these environment variables:

```bash
NODE_ENV=development|production
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
```

## Updates and Maintenance

When adding new external services:

1. Update `src/lib/security.ts` with new domains
2. Test in development with violation reporting
3. Update this documentation
4. Deploy and monitor for violations

## Related Files

- `src/middleware.ts` - CSP middleware
- `src/lib/security.ts` - Security configuration  
- `src/lib/csp.ts` - CSP utilities
- `src/components/CSPComponents.tsx` - CSP-safe components
- `next.config.ts` - Next.js security configuration
