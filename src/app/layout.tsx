import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "EventApp - Create Unforgettable Events",
  description: "The easiest way to create, manage, and share your events. From intimate gatherings to large conferences.",
  keywords: ["events", "event management", "registration", "organizer"],
  authors: [{ name: "EventApp Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
          <Toaster 
            theme="dark" 
            position="top-right"
            richColors
            closeButton
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
