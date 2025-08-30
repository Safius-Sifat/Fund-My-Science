/**
 * CSP Violation Reporter - helps debug CSP issues in development
 */

export function setupCSPReporting() {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
        return;
    }

    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
        console.group('🚨 CSP Violation Detected');
        console.error('Blocked URI:', event.blockedURI);
        console.error('Violated Directive:', event.violatedDirective);
        console.error('Original Policy:', event.originalPolicy);
        console.error('Source File:', event.sourceFile);
        console.error('Line Number:', event.lineNumber);
        console.error('Column Number:', event.columnNumber);
        console.error('Sample:', event.sample);
        console.groupEnd();

        // Optional: Send to analytics or error tracking
        if (process.env.NODE_ENV === 'development') {
            // You can add error tracking here if needed
            console.warn('Consider updating your CSP policy to allow:', event.blockedURI);
        }
    });

    console.log('🔒 CSP violation reporting enabled for development');
}

export function logCSPStatus() {
    if (typeof window === 'undefined') return;

    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
        console.log('🔒 CSP Meta Tag Found:', cspMeta.getAttribute('content'));
    } else {
        console.log('🔒 CSP is handled by HTTP headers');
    }
}
