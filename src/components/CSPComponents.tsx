import { getNonce } from '@/lib/csp';

interface CSPScriptProps {
    children: string;
    defer?: boolean;
    async?: boolean;
}

/**
 * CSP-safe script component that uses nonce when available
 */
export async function CSPScript({ children, defer, async }: CSPScriptProps) {
    const nonce = await getNonce();

    return (
        <script
            nonce={nonce || undefined}
            defer={defer}
            async={async}
            dangerouslySetInnerHTML={{ __html: children }}
        />
    );
}

interface CSPStyleProps {
    children: string;
}

/**
 * CSP-safe style component that uses nonce when available
 */
export async function CSPStyle({ children }: CSPStyleProps) {
    const nonce = await getNonce();

    return (
        <style
            nonce={nonce || undefined}
            dangerouslySetInnerHTML={{ __html: children }}
        />
    );
}

/**
 * Hook to get the current nonce for client-side usage
 */
export function useCSPNonce() {
    // In client-side, nonce should be passed via meta tag or data attribute
    if (typeof document !== 'undefined') {
        const metaNonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content');
        return metaNonce || null;
    }
    return null;
}
