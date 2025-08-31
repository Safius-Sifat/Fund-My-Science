import AuthDebugger from "@/components/AuthDebugger";
import { AuthProvider } from "@/contexts/AuthContext";
import { Web3Provider } from "@/contexts/Web3Context";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FundMyScience - Decentralized Research Funding Platform",
  description: "Connect researchers with investors through blockchain-powered funding and milestone-based project execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* CSP Reporting for development */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                document.addEventListener('securitypolicyviolation', (event) => {
                  console.group('🚨 CSP Violation Detected');
                  console.error('Blocked URI:', event.blockedURI);
                  console.error('Violated Directive:', event.violatedDirective);
                  console.error('Original Policy:', event.originalPolicy);
                  console.error('Source File:', event.sourceFile);
                  console.error('Line Number:', event.lineNumber);
                  console.error('Sample:', event.sample);
                  console.groupEnd();
                });
                console.log('🔒 CSP violation reporting enabled');
              `
            }}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Web3Provider>
            {children}
            <AuthDebugger />
          </Web3Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
