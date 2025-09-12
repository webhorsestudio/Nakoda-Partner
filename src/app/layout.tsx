import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";
import { AutoFetchProvider } from "@/contexts/AutoFetchContext";
import { GlobalOrderProvider } from "@/contexts/GlobalOrderProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nakoda Partner",
  description: "Partner management system for Nakoda",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalOrderProvider>
          <AutoFetchProvider>
            <ToastProvider />
            <ServiceWorkerRegistration />
            {children}
          </AutoFetchProvider>
        </GlobalOrderProvider>
      </body>
    </html>
  );
}
