import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import MantineProviderWrapper from '@/components/providers/MantineProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TMH Client Portal',
  description: 'Professional trademark search and analysis platform',
  keywords: 'trademark, search, analysis, legal, intellectual property',
  authors: [{ name: 'TMH Legal Services' }],
  robots: 'noindex, nofollow', // Prevent indexing for client portal
  openGraph: {
    title: 'TMH Client Portal',
    description: 'Professional trademark search and analysis platform',
    type: 'website',
    locale: 'en_US',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <MantineProviderWrapper>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
              {children}
            </div>
          </MantineProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}