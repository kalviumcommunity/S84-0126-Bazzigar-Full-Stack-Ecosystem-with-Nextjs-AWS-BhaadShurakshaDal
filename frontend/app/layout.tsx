import { Inter } from 'next/font/google';
import "./globals.css";
import type { Metadata } from 'next';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BhaadShurakshaDal | AI Flood Warning System',
  description: 'Real-time flood risk monitoring and early alerts for communities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
