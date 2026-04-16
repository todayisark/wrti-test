import type { Metadata } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import MuiThemeProvider from '@/lib/MuiThemeProvider';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'WRTI',
    template: '%s | WRTI',
  },
  description: '她们的孩子人格测试',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} font-mono`}
    >
      <body className="min-h-full flex flex-col">
        <MuiThemeProvider>{children}</MuiThemeProvider>
      </body>
      <Analytics />
    </html>
  );
}
