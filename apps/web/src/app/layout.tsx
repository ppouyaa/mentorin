import type { Metadata } from 'next';
import { Inter, Vazirmatn } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mentorship Platform',
  description: 'Connect with mentors and mentees for personalized learning experiences',
  keywords: ['mentorship', 'learning', 'education', 'mentoring', 'skills'],
  authors: [{ name: 'Mentorship Platform Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mentorship-platform.com',
    title: 'Mentorship Platform',
    description: 'Connect with mentors and mentees for personalized learning experiences',
    siteName: 'Mentorship Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentorship Platform',
    description: 'Connect with mentors and mentees for personalized learning experiences',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${vazirmatn.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}