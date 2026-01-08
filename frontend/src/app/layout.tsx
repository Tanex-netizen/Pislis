import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

// Preload critical fonts
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  preload: true,
});

// Comprehensive metadata for SEO
export const metadata: Metadata = {
  title: {
    default: 'Darwin - Facebook Automation & Page Growth Mastery',
    template: '%s | Darwin Education',
  },
  description: 'Master Facebook automation and grow your page organically. Learn proven strategies to monetize your FB page without spending on ads.',
  keywords: ['Facebook automation', 'page growth', 'social media marketing', 'organic growth', 'monetization'],
  authors: [{ name: 'Darwin Education' }],
  creator: 'Darwin Education',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://darwin.education'),
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Darwin Education',
    title: 'Darwin - Facebook Automation & Page Growth Mastery',
    description: 'Master Facebook automation and grow your page organically.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Darwin - Facebook Automation Mastery',
    description: 'Master Facebook automation and grow your page organically.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#10B981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        {/* Preconnect to API */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'} />
      </head>
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
