import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";
import { AutoFetchProvider } from "@/contexts/AutoFetchContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nakoda Partner",
  description: "Admin dashboard for Nakoda Partner",
};

// Register service worker for background auto-fetch
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AutoFetchProvider>
          {children}
          <ToastProvider />
        </AutoFetchProvider>
      </body>
    </html>
  );
}
